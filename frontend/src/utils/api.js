export async function fetchNotices() {
  const res = await fetch('/api/notices');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch notice history');
  }
  return res.json();
}

export async function fetchNoticeDetails(id) {
  const res = await fetch(`/api/notices/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch notice details');
  }
  return res.json();
}

export async function analyzeNotice(payload) {
  const res = await fetch('/api/notices/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || 'Failed to analyze notice using Groq AI');
  }
  return res.json();
}

export async function updateChecklist(id, itemId, completed) {
  const res = await fetch(`/api/notices/${id}/checklist`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, completed })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update checklist item status');
  }
  return res.json();
}

export async function deleteNotice(id) {
  const res = await fetch(`/api/notices/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete notice');
  }
  return res.json();
}
