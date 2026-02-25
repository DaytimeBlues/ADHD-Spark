# Figma MCP Setup

Use Figma MCP to get design context and overviews for Spark screens before implementation.

## What it is good for

- Screen structure and component hierarchy overviews
- Spacing/typography/token inspection from selected frames
- Design-to-code delta checks before coding

## Recommended server endpoints

- Remote: `https://mcp.figma.com/mcp`
- Desktop (local): `http://127.0.0.1:3845/mcp`

## Enable desktop server

1. Open Figma desktop app
2. Open a design file
3. Switch to Dev Mode (`Shift + D`)
4. In Inspect panel, enable desktop MCP server

## Config added in this repo

This repo now includes `.mcp.json` with both `figma` (remote) and `figma-desktop` (local) MCP server entries.

## Example prompts

- "Give me an overview of this frame: hierarchy, spacing, typography, and reusable components."
- "Compare this frame with our React Native implementation and list mismatches."
- "Create a step-by-step implementation checklist for this selected screen."

## Auth notes

- Desktop mode uses your logged-in Figma desktop session.
- Remote mode uses Figma hosted MCP endpoint and your client's auth flow.
