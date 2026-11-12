/** Erro esperado da aplicação, com status HTTP e código estável para o cliente. */
export class AppError extends Error {
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export const unauthorized = (codigo = 'nao_autenticado', mensagem = 'Autenticação necessária.') =>
  new AppError(401, codigo, mensagem);

export const forbidden = (codigo = 'acesso_negado', mensagem = 'Você não tem permissão para esta ação.') =>
  new AppError(403, codigo, mensagem);
