export const fetchApi = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Assuming auth token would be injected here or handled by cookies
    ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
  };

  const response = await fetch(`/api${url}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data || json;
};
