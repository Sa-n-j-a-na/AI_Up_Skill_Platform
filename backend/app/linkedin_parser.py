# backend/app/linkedin_parser.py
import json
import csv
import io

def parse_linkedin_bytes(content_bytes: bytes, filename: str) -> dict:
    """
    Accepts LinkedIn export JSON or CSV bytes and returns structured dict.
    For MVP, we handle JSON exported profile (simple) or CSV with basic columns.
    """

    fname = filename.lower()
    if fname.endswith(".json"):
        try:
            data = json.loads(content_bytes.decode("utf-8"))
        except Exception as e:
            raise RuntimeError("Invalid JSON: " + str(e))
        # LinkedIn export format varies. Try to read common keys.
        parsed = {
            "name": data.get("firstName", "") + " " + data.get("lastName", "") if isinstance(data, dict) else "",
            "headline": data.get("headline", "") if isinstance(data, dict) else "",
            "skills": data.get("skills", []),
            "positions": data.get("positions", []),
            "education": data.get("education", []),
            "raw": data
        }
        return parsed

    elif fname.endswith(".csv"):
        # Try a generic CSV parser: return rows as list of dicts
        try:
            s = content_bytes.decode("utf-8")
            reader = csv.DictReader(io.StringIO(s))
            rows = [r for r in reader]
            # attempt to pull common columns
            parsed = {
                "rows_count": len(rows),
                "sample_row": rows[0] if rows else {},
                "rows": rows
            }
            return parsed
        except Exception as e:
            raise RuntimeError("CSV parse error: " + str(e))
    else:
        raise RuntimeError("Unsupported LinkedIn file type. Upload JSON or CSV export.")
