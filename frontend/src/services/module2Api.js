import api from './api';

const unwrap = (response) => response.data.data;

export const module2Api = {
  getSuppliers: () => api.get('/module2/suppliers').then(unwrap),
  createSupplier: (payload) => api.post('/module2/suppliers', payload).then(unwrap),
  updateSupplier: (id, payload) => api.put(`/module2/suppliers/${id}`, payload).then(unwrap),
  deleteSupplier: (id) => api.delete(`/module2/suppliers/${id}`).then(unwrap),
  getRecipes: () => api.get('/module2/recipes').then(unwrap),
  createRecipe: (payload) => api.post('/module2/recipes', payload).then(unwrap),
  deleteRecipe: (id) => api.delete(`/module2/recipes/${id}`).then(unwrap),
  getInventory: () => api.get('/module2/inventory/alerts').then((response) => response.data),
  createPurchaseOrder: (payload) => api.post('/module2/purchase-orders', payload).then(unwrap),
  ingestShipment: (id, payload) => api.post(`/module2/purchase-orders/${id}/ingest`, payload).then(unwrap),
  executeManufacturingRun: (payload) => api.post('/module2/manufacturing/run', payload).then(unwrap)
};
