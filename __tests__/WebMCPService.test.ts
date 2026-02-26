const mockRegisterTool = jest.fn();
const mockGetJSON = jest.fn();
const mockSetJSON = jest.fn();
const mockEmit = jest.fn();

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "web",
  select: jest.fn(
    (dict: { web?: unknown; default?: unknown }) => dict.web ?? dict.default,
  ),
}));

jest.mock("../src/services/StorageService", () => ({
  __esModule: true,
  default: {
    STORAGE_KEYS: {
      brainDump: "brainDump",
    },
    getJSON: mockGetJSON,
    setJSON: mockSetJSON,
  },
}));

jest.mock("../src/services/AgentEventBus", () => ({
  agentEventBus: {
    emit: mockEmit,
  },
}));

describe("WebMCPService", () => {
  afterEach(() => {
    const WebMCPService = require("../src/services/WebMCPService").default;
    WebMCPService.dispose();
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool: mockRegisterTool } },
      configurable: true,
      writable: true,
    });
    mockGetJSON.mockResolvedValue([]);
    mockSetJSON.mockResolvedValue(undefined);
  });

  it("registers tools and validates add_brain_dump input", async () => {
    const WebMCPService = require("../src/services/WebMCPService").default;

    WebMCPService.init();

    expect(mockRegisterTool).toHaveBeenCalled();
    const toolByName = Object.fromEntries(
      mockRegisterTool.mock.calls.map((call: [{ name: string }]) => [
        call[0].name,
        call[0],
      ]),
    );

    const addBrainDump = toolByName.add_brain_dump;
    const invalidResult = await addBrainDump.execute({ text: "   " });
    expect(invalidResult.success).toBe(false);

    const validResult = await addBrainDump.execute({ text: "  Plan day  " });
    expect(validResult.success).toBe(true);
    expect(mockSetJSON).toHaveBeenCalledWith(
      "brainDump",
      expect.arrayContaining([
        expect.objectContaining({ text: "Plan day", type: "text" }),
      ]),
    );
    expect(mockEmit).toHaveBeenCalledWith("braindump:add", {
      text: "Plan day",
    });
  });

  it("retries registration when modelContext appears later", () => {
    jest.useFakeTimers();
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
      writable: true,
    });

    const WebMCPService = require("../src/services/WebMCPService").default;
    WebMCPService.init();

    expect(mockRegisterTool).toHaveBeenCalledTimes(0);

    Object.defineProperty(globalThis, "navigator", {
      value: { modelContext: { registerTool: mockRegisterTool } },
      configurable: true,
      writable: true,
    });

    jest.advanceTimersByTime(1000);

    expect(mockRegisterTool).toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("clears pending retries on dispose", () => {
    jest.useFakeTimers();
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      configurable: true,
      writable: true,
    });

    const WebMCPService = require("../src/services/WebMCPService").default;
    WebMCPService.init();

    expect(jest.getTimerCount()).toBeGreaterThan(0);

    WebMCPService.dispose();

    expect(jest.getTimerCount()).toBe(0);
  });
});
