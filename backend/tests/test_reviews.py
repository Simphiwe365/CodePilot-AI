def get_auth_headers(client, email="alice@codepilot.ai"):
    client.post(
        "/auth/register",
        json={"email": email, "password": "Password123!", "full_name": email.split("@")[0]}
    )
    login_res = client.post(
        "/auth/login",
        data={"username": email, "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_code_review_lifecycle_and_ownership(client):
    headers_a = get_auth_headers(client, "alice@codepilot.ai")
    headers_b = get_auth_headers(client, "bob@codepilot.ai")

    # 1. Submit code review as Alice
    sub_res = client.post(
        "/reviews/",
        headers=headers_a,
        json={
            "language": "python",
            "code": "def divide(a, b):\n    return a / b"
        }
    )
    assert sub_res.status_code == 201
    review = sub_res.json()
    assert review["status"] == "completed"
    assert review["language"] == "python"
    review_id = review["id"]

    # 2. Get review stats for Alice
    stats_res = client.get("/reviews/stats", headers=headers_a)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_reviews"] == 1
    assert stats["completed"] == 1

    # 3. Get single review by ID as Alice
    single_res = client.get(f"/reviews/{review_id}", headers=headers_a)
    assert single_res.status_code == 200
    assert single_res.json()["id"] == review_id

    # 4. Attempt to access Alice's review as Bob (Should fail 404 / Unauthorized)
    bob_access_res = client.get(f"/reviews/{review_id}", headers=headers_b)
    assert bob_access_res.status_code == 404

    # 5. Attempt to delete Alice's review as Bob (Should fail 404)
    bob_del_res = client.delete(f"/reviews/{review_id}", headers=headers_b)
    assert bob_del_res.status_code == 404

    # 6. Delete review as Alice (Should succeed 204)
    alice_del_res = client.delete(f"/reviews/{review_id}", headers=headers_a)
    assert alice_del_res.status_code == 204

    # 7. Confirm review is gone
    get_gone_res = client.get(f"/reviews/{review_id}", headers=headers_a)
    assert get_gone_res.status_code == 404


def test_pagination_and_validation(client):
    headers = get_auth_headers(client, "carol@codepilot.ai")

    # Validation: code too short
    short_res = client.post(
        "/reviews/",
        headers=headers,
        json={"language": "python", "code": "x"}
    )
    assert short_res.status_code == 422

    # Create 3 reviews
    for i in range(3):
        client.post(
            "/reviews/",
            headers=headers,
            json={"language": "python", "code": f"def test_{i}(): pass"}
        )

    # Test pagination: limit 2
    res_page1 = client.get("/reviews/?skip=0&limit=2", headers=headers)
    assert res_page1.status_code == 200
    assert len(res_page1.json()) == 2

    # Test pagination: skip 2, limit 2
    res_page2 = client.get("/reviews/?skip=2&limit=2", headers=headers)
    assert res_page2.status_code == 200
    assert len(res_page2.json()) == 1

