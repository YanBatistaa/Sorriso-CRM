// Uma paleta de cores pré-definida usando classes do Tailwind CSS para o fundo e o texto.
const COLOR_PALETTE = [
    'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
];

/**
 * Uma função de hash simples que converte um texto (como um UUID) num número.
 * Isto garante que o mesmo ID de especialista resultará sempre no mesmo número.
 */
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Converte para um inteiro de 32bit
    }
    return Math.abs(hash);
};

/**
 * Retorna uma classe de cor consistente do Tailwind CSS com base no ID de um especialista.
 * @param specialistId - O UUID do especialista.
 * @returns Uma string com as classes de cor do Tailwind (ex: 'bg-sky-100 text-sky-800').
 */
export const getSpecialistColorClass = (specialistId: string): string => {
    if (!specialistId) return 'bg-gray-100 text-gray-800'; // Cor padrão
    const hash = simpleHash(specialistId);
    const index = hash % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
};