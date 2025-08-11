// src/lib/formatters.ts

export const formatCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };
  
  export const formatPhone = (phone: string | null | undefined): string => {
    if (!phone) return '';
  
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
  
    // Remove o '55' do início se for um número vindo do banco,
    // para que a máscara seja aplicada apenas no número local.
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }
  
    // Limita o número de dígitos para evitar que a máscara quebre
    cleaned = cleaned.slice(0, 11);
  
    // Aplica a máscara de telefone local de forma progressiva
    if (cleaned.length > 10) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length > 6) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (cleaned.length > 2) {
      return cleaned.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    
    return cleaned;
  };