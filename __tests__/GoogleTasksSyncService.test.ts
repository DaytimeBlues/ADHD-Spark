import { Platform } from "react-native";
import GoogleTasksSyncService from "../src/services/GoogleTasksSyncService";
import StorageService from "../src/services/StorageService";
import OverlayService from "../src/services/OverlayService";

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signInSilently: jest.fn(),
    getTokens: jest.fn(),
  },
}));

jest.mock("../src/services/StorageService", () => ({
  __esModule: true,
  default: {
    STORAGE_KEYS: {
      brainDump: "brainDump",
      googleTasksSyncState: "googleTasksSyncState",
      googleTasksProcessedIds: "googleTasksProcessedIds",
      googleTasksLastSyncAt: "googleTasksLastSyncAt",
      googleTasksExportedFingerprints: "googleTasksExportedFingerprints",
    },
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../src/services/OverlayService", () => ({
  __esModule: true,
  default: {
    updateCount: jest.fn(),
  },
}));

describe("GoogleTasksSyncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", { value: "android" });
    (StorageService.getJSON as jest.Mock).mockImplementation((key: string) => {
      if (key === "googleTasksSyncState") {
        return Promise.resolve({ listId: "list-1", syncToken: "sync-1" });
      }
      if (key === "googleTasksProcessedIds") {
        return Promise.resolve([]);
      }
      if (key === "brainDump") {
        return Promise.resolve([]);
      }
      if (key === "googleTasksExportedFingerprints") {
        return Promise.resolve([]);
      }
      return Promise.resolve(null);
    });
    (StorageService.setJSON as jest.Mock).mockResolvedValue(undefined);
    (StorageService.set as jest.Mock).mockResolvedValue(undefined);

    const {
      GoogleSignin,
    } = require("@react-native-google-signin/google-signin");
    GoogleSignin.signInSilently.mockResolvedValue({});
    GoogleSignin.getTokens.mockResolvedValue({ accessToken: "token-123" });
  });

  it("imports Google delta tasks, marks them complete, and persists sync token", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              id: "task-1",
              title: "Plan sprint",
              notes: "break down milestones",
              updated: "2026-02-26T12:00:00.000Z",
              status: "needsAction",
            },
          ],
          nextSyncToken: "sync-2",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "task-1" }),
      });

    const result = await GoogleTasksSyncService.syncToBrainDump();

    expect(result.importedCount).toBe(1);
    expect(result.markedCompletedCount).toBe(1);
    expect(result.syncTokenUpdated).toBe(true);
    expect(StorageService.setJSON).toHaveBeenCalledWith(
      "googleTasksSyncState",
      { listId: "list-1", syncToken: "sync-2" },
    );
    expect(OverlayService.updateCount).toHaveBeenCalledWith(1);
  });

  it("exports sorted items to Tasks and Calendar and stores fingerprints", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [{ id: "list-1", title: "Spark Inbox" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "task-created" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "event-created" }),
      });

    const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
      { text: "Buy milk", category: "task", priority: "high" },
      {
        text: "Dentist",
        category: "event",
        priority: "medium",
        start: "2026-03-01T09:00:00.000Z",
        end: "2026-03-01T09:30:00.000Z",
      },
    ]);

    expect(result.authRequired).toBe(false);
    expect(result.createdTasks).toBe(1);
    expect(result.createdEvents).toBe(1);
    expect(StorageService.setJSON).toHaveBeenCalledWith(
      "googleTasksExportedFingerprints",
      expect.any(Array),
    );
  });

  it("returns authRequired when token is unavailable", async () => {
    const {
      GoogleSignin,
    } = require("@react-native-google-signin/google-signin");
    GoogleSignin.signInSilently.mockRejectedValue(new Error("missing auth"));

    const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
      { text: "Pay rent", category: "task", priority: "high" },
    ]);

    expect(result.authRequired).toBe(true);
    expect(result.createdTasks).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
