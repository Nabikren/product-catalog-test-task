import type { ImportMethod, ImportResult, ImportOptions, LoadingState } from '~/types';

export const useImport = () => {
  const api = useApi();

  // Reactive state
  const loading = ref<LoadingState>('idle');
  const error = ref<string | null>(null);
  const progress = ref(0);
  const result = ref<ImportResult | null>(null);

  // Import from file
  const importFromFile = async (file: File): Promise<ImportResult | null> => {
    try {
      loading.value = 'loading';
      error.value = null;
      progress.value = 0;

      // Simulate progress
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += Math.random() * 20;
        }
      }, 300);

      const importResult = await api.importData.fromFile(file);
      
      clearInterval(progressInterval);
      progress.value = 100;
      
      result.value = importResult;
      loading.value = 'success';

      return importResult;
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Ошибка импорта файла';
      progress.value = 0;
      console.error('Import file error:', err);
      return null;
    }
  };

  // Import from Google Sheets
  const importFromGoogleSheets = async (
    spreadsheetId: string, 
    range?: string
  ): Promise<ImportResult | null> => {
    try {
      loading.value = 'loading';
      error.value = null;
      progress.value = 0;

      // Simulate progress
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += Math.random() * 20;
        }
      }, 300);

      const importResult = await api.importData.fromGoogleSheets(spreadsheetId, range);
      
      clearInterval(progressInterval);
      progress.value = 100;
      
      result.value = importResult;
      loading.value = 'success';

      return importResult;
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Ошибка импорта из Google Sheets';
      progress.value = 0;
      console.error('Import Google Sheets error:', err);
      return null;
    }
  };

  // Import from URL (for future implementation)
  const importFromUrl = async (url: string): Promise<ImportResult | null> => {
    try {
      loading.value = 'loading';
      error.value = null;
      progress.value = 0;

      const importResult = await api.importData.fromUrl(url);
      
      progress.value = 100;
      result.value = importResult;
      loading.value = 'success';

      return importResult;
    } catch (err) {
      loading.value = 'error';
      error.value = err instanceof Error ? err.message : 'Ошибка импорта по URL';
      progress.value = 0;
      console.error('Import URL error:', err);
      return null;
    }
  };

  // Generic import method
  const importData = async (options: ImportOptions): Promise<ImportResult | null> => {
    switch (options.method) {
      case 'file':
        if (!options.file) {
          error.value = 'Файл не выбран';
          return null;
        }
        return await importFromFile(options.file);

      case 'google_sheets':
        if (!options.spreadsheetId) {
          error.value = 'ID Google Sheets не указан';
          return null;
        }
        return await importFromGoogleSheets(options.spreadsheetId, options.range);

      case 'url':
        if (!options.url) {
          error.value = 'URL не указан';
          return null;
        }
        return await importFromUrl(options.url);

      default:
        error.value = 'Неизвестный метод импорта';
        return null;
    }
  };

  // Reset state
  const reset = () => {
    loading.value = 'idle';
    error.value = null;
    progress.value = 0;
    result.value = null;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Неподдерживаемый формат файла. Разрешены: .xlsx, .xls, .csv';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Файл слишком большой. Максимальный размер: 10MB';
    }

    return null;
  };

  // Extract Google Sheets ID from URL
  const extractGoogleSheetsId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Computed properties
  const isLoading = computed(() => loading.value === 'loading');
  const hasError = computed(() => loading.value === 'error');
  const isSuccess = computed(() => loading.value === 'success');
  const isIdle = computed(() => loading.value === 'idle');

  // Import statistics
  const importStats = computed(() => {
    if (!result.value) return null;

    const { totalRows, successfulImports, errors } = result.value;
    const errorCount = errors.length;
    const successRate = totalRows > 0 ? (successfulImports / totalRows) * 100 : 0;

    return {
      total: totalRows,
      success: successfulImports,
      errors: errorCount,
      successRate: Math.round(successRate),
    };
  });

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    progress: readonly(progress),
    result: readonly(result),

    // Computed
    isLoading,
    hasError,
    isSuccess,
    isIdle,
    importStats,

    // Methods
    importData,
    importFromFile,
    importFromGoogleSheets,
    importFromUrl,
    reset,
    validateFile,
    extractGoogleSheetsId,
  };
};
