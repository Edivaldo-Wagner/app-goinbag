// SessionStore.js
const SessionStore = {
  origem: '',
  destino: '',
  carga: '',
  valorSeguro: '',
  
  setOrigem(value) { this.origem = value; },
  setDestino(value) { this.destino = value; },
  setCarga(value) { this.carga = value; },
  setValorSeguro(value) { this.valorSeguro = value; },

  getOrigem() { return this.origem; },
  getDestino() { return this.destino; },
  getCarga() { return this.carga; },
  getValorSeguro() { return this.valorSeguro; },
  
  // Adicione esta linha para resolver a chamada do ResultadosBusca.js
  getSeguro() { return this.valorSeguro; },
};

export default SessionStore;