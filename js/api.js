const BACKEND_URL =
  "https://santiago-financial-project-a9d6eecgfyfdhbce.canadacentral-01.azurewebsites.net/api";

const DEFAULT_ERROR_RESPONSE = JSON.stringify({
  response: "Ocurrió un error",
});

export async function httpPost(
  endpoint,
  body = {},
  useAuth = false,
  onUnauthorized,
) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...buildAuthHeaders(useAuth, onUnauthorized),
  };

  const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    await handleUnauthorized(response, onUnauthorized);
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || DEFAULT_ERROR_RESPONSE);
  }

  return await response.json();
}

export async function httpGet(
  endpoint,
  params = {},
  useAuth = false,
  onUnauthorized,
) {
  const query = new URLSearchParams(params).toString();
  const finalUrl = query
    ? `${BACKEND_URL}/${endpoint}?${query}`
    : `${BACKEND_URL}/${endpoint}`;

  const headers = {
    Accept: "application/json",
    ...buildAuthHeaders(useAuth, onUnauthorized),
  };

  const response = await fetch(finalUrl, {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    await handleUnauthorized(response, onUnauthorized);
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || DEFAULT_ERROR_RESPONSE);
  }

  return await response.json();
}

export async function httpDelete(
  endpoint,
  params = {},
  useAuth = false,
  onUnauthorized,
) {
  const query = new URLSearchParams(params).toString();
  const finalUrl = query
    ? `${BACKEND_URL}/${endpoint}?${query}`
    : `${BACKEND_URL}/${endpoint}`;

  const headers = {
    Accept: "application/json",
    ...buildAuthHeaders(useAuth, onUnauthorized),
  };

  const response = await fetch(finalUrl, {
    method: "DELETE",
    headers,
  });

  if (response.status === 401) {
    await handleUnauthorized(response, onUnauthorized);
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || DEFAULT_ERROR_RESPONSE);
  }

  return await response.json();
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function buildAuthHeaders(useAuth, onUnauthorized) {
  if (!useAuth) return {};

  const token = getAccessToken();

  if (!token) {
    if (typeof onUnauthorized === "function") {
      onUnauthorized();
    }
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function handleUnauthorized(response, onUnauthorized) {
  if (response.status === 401 && typeof onUnauthorized === "function") {
    onUnauthorized();
  }
}
