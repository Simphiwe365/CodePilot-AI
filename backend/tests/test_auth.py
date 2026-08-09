def test_register_and_login_user(client):
    # 1. Register
    reg_response = client.post(
        "/auth/register",
        json={
            "email": "dev@codepilot.ai",
            "password": "SecurePassword123!",
            "full_name": "Dev User"
        }
    )
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert data["email"] == "dev@codepilot.ai"

    # 2. Login
    login_response = client.post(
        "/auth/login",
        data={
            "username": "dev@codepilot.ai",
            "password": "SecurePassword123!"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 3. Get /auth/me
    token = token_data["access_token"]
    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "dev@codepilot.ai"
