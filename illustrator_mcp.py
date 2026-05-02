#!/usr/bin/env python3
"""
Minimal Adobe Illustrator MCP server.

This server is intentionally dependency-free. It implements enough of MCP over
stdio to expose a small set of Illustrator tools to an MCP client. It must run
on macOS on the same machine as Adobe Illustrator because it uses AppleScript.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


SERVER_INFO = {"name": "minimal-illustrator-mcp", "version": "0.1.0"}
PROTOCOL_VERSION = "2024-11-05"
ILLUSTRATOR_APP_ID = os.environ.get("ILLUSTRATOR_APP_ID", "com.adobe.illustrator").strip()
ILLUSTRATOR_APP = os.environ.get("ILLUSTRATOR_APP", "Adobe Illustrator").strip()


def _response(message_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": message_id, "result": result}


def _error(message_id: Any, code: int, message: str, data: Any | None = None) -> dict[str, Any]:
    err: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        err["data"] = data
    return {"jsonrpc": "2.0", "id": message_id, "error": err}


def _content(text: str) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": text}]}


def _emit(payload: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def _run_osascript(script: str, timeout: int) -> str:
    proc = subprocess.run(
        ["osascript", "-e", script],
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )
    if proc.returncode != 0:
        stderr = proc.stderr.strip() or proc.stdout.strip() or "osascript failed"
        raise RuntimeError(stderr)
    return proc.stdout.strip()


def _escape_applescript_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def _illustrator_tell_target() -> str:
    if ILLUSTRATOR_APP_ID:
        return f'application id "{_escape_applescript_string(ILLUSTRATOR_APP_ID)}"'
    return f'application "{_escape_applescript_string(ILLUSTRATOR_APP)}"'


def _illustrator_do_javascript(js_code: str, timeout: int = 30) -> str:
    with tempfile.NamedTemporaryFile("w", suffix=".jsx", delete=False, encoding="utf-8") as handle:
        handle.write(js_code)
        jsx_path = handle.name
    try:
        path = _escape_applescript_string(jsx_path)
        target = _illustrator_tell_target()
        script = f'''
tell {target}
    activate
    do javascript POSIX file "{path}"
end tell
'''
        return _run_osascript(script, timeout=timeout)
    finally:
        Path(jsx_path).unlink(missing_ok=True)


def _tool_list() -> list[dict[str, Any]]:
    return [
        {
            "name": "illustrator_eval_js",
            "description": "Run ExtendScript JavaScript in the active Adobe Illustrator application.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "ExtendScript JavaScript to execute in Illustrator.",
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in seconds.",
                        "default": 30,
                        "minimum": 1,
                        "maximum": 300,
                    },
                },
                "required": ["code"],
                "additionalProperties": False,
            },
        },
        {
            "name": "illustrator_document_info",
            "description": "Return basic information about the active Illustrator document.",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
        {
            "name": "illustrator_set_selection_fill",
            "description": "Set the RGB fill color of selected Illustrator page items.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "r": {"type": "integer", "minimum": 0, "maximum": 255},
                    "g": {"type": "integer", "minimum": 0, "maximum": 255},
                    "b": {"type": "integer", "minimum": 0, "maximum": 255},
                },
                "required": ["r", "g", "b"],
                "additionalProperties": False,
            },
        },
        {
            "name": "illustrator_set_selection_stroke",
            "description": "Set the RGB stroke color and optional stroke width of selected Illustrator page items.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "r": {"type": "integer", "minimum": 0, "maximum": 255},
                    "g": {"type": "integer", "minimum": 0, "maximum": 255},
                    "b": {"type": "integer", "minimum": 0, "maximum": 255},
                    "width": {"type": "number", "minimum": 0},
                },
                "required": ["r", "g", "b"],
                "additionalProperties": False,
            },
        },
    ]


def _document_info() -> str:
    js = r'''
if (app.documents.length === 0) {
  "No open Illustrator document.";
} else {
  var doc = app.activeDocument;
  var out = [];
  out.push("name: " + doc.name);
  out.push("artboards: " + doc.artboards.length);
  out.push("pageItems: " + doc.pageItems.length);
  out.push("selection: " + doc.selection.length);
  out.push("colorSpace: " + doc.documentColorSpace);
  out.join("\n");
}
'''
    return _illustrator_do_javascript(js)


def _set_selection_fill(r: int, g: int, b: int) -> str:
    js = f'''
if (app.documents.length === 0) {{
  "No open Illustrator document.";
}} else {{
  var doc = app.activeDocument;
  var color = new RGBColor();
  color.red = {r};
  color.green = {g};
  color.blue = {b};
  var count = 0;
  for (var i = 0; i < doc.selection.length; i++) {{
    var item = doc.selection[i];
    try {{
      item.filled = true;
      item.fillColor = color;
      count++;
    }} catch (e) {{}}
  }}
  "Updated fill color for " + count + " selected item(s).";
}}
'''
    return _illustrator_do_javascript(js)


def _set_selection_stroke(r: int, g: int, b: int, width: float | None) -> str:
    width_line = "" if width is None else f"item.strokeWidth = {float(width)};"
    js = f'''
if (app.documents.length === 0) {{
  "No open Illustrator document.";
}} else {{
  var doc = app.activeDocument;
  var color = new RGBColor();
  color.red = {r};
  color.green = {g};
  color.blue = {b};
  var count = 0;
  for (var i = 0; i < doc.selection.length; i++) {{
    var item = doc.selection[i];
    try {{
      item.stroked = true;
      item.strokeColor = color;
      {width_line}
      count++;
    }} catch (e) {{}}
  }}
  "Updated stroke for " + count + " selected item(s).";
}}
'''
    return _illustrator_do_javascript(js)


def _call_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    if name == "illustrator_eval_js":
        code = arguments.get("code")
        if not isinstance(code, str) or not code.strip():
            raise ValueError("`code` must be a non-empty string.")
        timeout = int(arguments.get("timeout", 30))
        return _content(_illustrator_do_javascript(code, timeout=timeout) or "JavaScript executed.")

    if name == "illustrator_document_info":
        return _content(_document_info())

    if name == "illustrator_set_selection_fill":
        return _content(_set_selection_fill(int(arguments["r"]), int(arguments["g"]), int(arguments["b"])))

    if name == "illustrator_set_selection_stroke":
        width_arg = arguments.get("width")
        width = None if width_arg is None else float(width_arg)
        return _content(
            _set_selection_stroke(int(arguments["r"]), int(arguments["g"]), int(arguments["b"]), width)
        )

    raise ValueError(f"Unknown tool: {name}")


def _handle(request: dict[str, Any]) -> dict[str, Any] | None:
    method = request.get("method")
    message_id = request.get("id")
    params = request.get("params") or {}

    if method == "initialize":
        return _response(
            message_id,
            {
                "protocolVersion": params.get("protocolVersion", PROTOCOL_VERSION),
                "capabilities": {"tools": {}},
                "serverInfo": SERVER_INFO,
            },
        )

    if method == "notifications/initialized":
        return None

    if method == "tools/list":
        return _response(message_id, {"tools": _tool_list()})

    if method == "tools/call":
        try:
            name = params.get("name")
            arguments = params.get("arguments") or {}
            if not isinstance(name, str):
                raise ValueError("Missing tool name.")
            if not isinstance(arguments, dict):
                raise ValueError("Tool arguments must be an object.")
            return _response(message_id, _call_tool(name, arguments))
        except Exception as exc:  # MCP tool errors should be returned as tool content.
            return _response(message_id, {"content": [{"type": "text", "text": f"Error: {exc}"}], "isError": True})

    if message_id is None:
        return None
    return _error(message_id, -32601, f"Method not found: {method}")


def main() -> int:
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            response = _handle(request)
        except Exception as exc:
            response = _error(None, -32700, "Parse or server error", str(exc))
        if response is not None:
            _emit(response)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
