"""Guardrail cho code phân tích Python do AI sinh ra.

Nguyên tắc "không thực thi ngầm": code chỉ chạy sau khi con người phê duyệt.
Lớp bảo vệ này chặn các thao tác nguy hiểm trước khi thực thi cục bộ:
- Cấm mọi import.
- Cấm truy cập thuộc tính dunder (__globals__, __class__, __subclasses__, ...).
- Cấm các builtin nguy hiểm (eval, exec, open, __import__, os, sys, ...).
Chỉ cho phép thao tác trên DataFrame `df` và thư viện `pd` (pandas).
"""

import ast

from fastapi import HTTPException

_FORBIDDEN_NAMES = {
    "eval",
    "exec",
    "compile",
    "open",
    "input",
    "__import__",
    "globals",
    "locals",
    "vars",
    "getattr",
    "setattr",
    "delattr",
    "os",
    "sys",
    "subprocess",
    "socket",
    "shutil",
    "pathlib",
    "importlib",
    "builtins",
}

# Builtins an toàn được cấp cho môi trường thực thi
SAFE_BUILTINS = {
    "abs": abs,
    "min": min,
    "max": max,
    "sum": sum,
    "len": len,
    "round": round,
    "sorted": sorted,
    "range": range,
    "enumerate": enumerate,
    "zip": zip,
    "list": list,
    "dict": dict,
    "set": set,
    "tuple": tuple,
    "float": float,
    "int": int,
    "str": str,
    "bool": bool,
    "print": print,
}


def ensure_safe_python(code: str) -> None:
    if not code or not code.strip():
        raise HTTPException(status_code=400, detail="Đoạn code rỗng.")

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise HTTPException(status_code=400, detail=f"Code Python không hợp lệ: {e}")

    for node in ast.walk(tree):
        # Cấm import
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            raise HTTPException(status_code=400, detail="Không cho phép import trong code phân tích.")

        # Cấm truy cập thuộc tính dunder (né sandbox)
        if isinstance(node, ast.Attribute) and node.attr.startswith("__") and node.attr.endswith("__"):
            raise HTTPException(
                status_code=400,
                detail=f"Không cho phép truy cập thuộc tính '{node.attr}'.",
            )

        # Cấm dùng tên bị chặn
        if isinstance(node, ast.Name) and node.id in _FORBIDDEN_NAMES:
            raise HTTPException(
                status_code=400,
                detail=f"Không cho phép sử dụng '{node.id}'.",
            )

    # Bắt buộc có gán biến `result` để lấy kết quả
    if "result" not in code:
        raise HTTPException(
            status_code=400,
            detail="Code phải gán kết quả vào biến `result` (ví dụ: result = df...).",
        )
