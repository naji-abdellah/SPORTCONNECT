path = r'C:/Users/DELL/CAREER/GLD/S4/APPLICATION NATIVE CLOUD/sportconnect-docker/frontend/src/services/api.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "  leaveSession: (id) => api.post(`/sessions/${id}/leave`),",
    """  leaveSession: (id) => api.post(`/sessions/${id}/leave`),
  cancelSession: (id, userId) => api.post(`/sessions/${id}/cancel`, { userId }),
  deleteSession: (id, userId) => api.delete(`/sessions/${id}`, { data: { userId } }),"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('api.js done')