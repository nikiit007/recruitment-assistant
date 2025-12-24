import json
import os
import ssl
import urllib.request


def _bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def main() -> None:
    uri = os.getenv("MILVUS_URI")
    token = os.getenv("MILVUS_TOKEN")
    if not uri or not token:
        raise SystemExit("MILVUS_URI and MILVUS_TOKEN must be set")

    url = f"{uri.rstrip('/')}/v2/vectordb/collections/list"
    request = urllib.request.Request(
        url=url,
        method="POST",
        headers={
            "accept": "application/json",
            "authorization": f"Bearer {token}",
            "content-type": "application/json",
        },
        data=json.dumps({}).encode("utf-8"),
    )

    context = None
    if _bool_env("MILVUS_TLS_INSECURE"):
        context = ssl._create_unverified_context()

    with urllib.request.urlopen(request, context=context) as response:
        payload = json.loads(response.read().decode("utf-8"))
    print(payload)


if __name__ == "__main__":
    main()
