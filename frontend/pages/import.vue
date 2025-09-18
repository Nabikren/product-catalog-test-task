<template>
  <div class="container">
    <div class="import">
      <!-- Header -->
      <div class="import__header">
        <h1 class="import__title">Импорт продуктов</h1>
        <p class="import__subtitle">
          Загрузите данные из Excel файла, CSV или Google Sheets
        </p>
      </div>
      
      <div class="import__content">
        <!-- Import methods -->
        <div v-if="!showForm" class="import__methods">
          <div 
            v-for="method in importMethods" 
            :key="method.type"
            class="import__method"
            :class="{ 'import__method--active': selectedMethod === method.type }"
            @click="selectMethod(method.type)"
          >
            <div class="import__method-icon">
              <Icon :name="method.icon" />
            </div>
            <h3 class="import__method-title">
              {{ method.title }}
            </h3>
            <p class="import__method-description">
              {{ method.description }}
            </p>
          </div>
        </div>
        
        <!-- Import form -->
        <div v-if="showForm" class="import__form">
          <div class="import__form-title">
            {{ getMethodTitle(selectedMethod) }}
          </div>
          
          <!-- File upload -->
          <div v-if="selectedMethod === 'file'" class="import__dropzone-container">
            <div 
              ref="dropzoneRef"
              class="import__dropzone"
              :class="{ 
                'import__dropzone--dragover': isDragOver,
                'import__dropzone--error': uploadError 
              }"
              @click="triggerFileInput"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleFileDrop"
            >
              <Icon 
                :name="uploadError ? 'heroicons:exclamation-triangle' : 'heroicons:cloud-arrow-up'" 
                class="import__dropzone-icon" 
              />
              <div class="import__dropzone-text">
                {{ uploadError || 'Перетащите файл сюда или нажмите для выбора' }}
              </div>
              <div v-if="!uploadError" class="import__dropzone-subtext">
                Поддерживаются форматы: .xlsx, .xls, .csv
              </div>
            </div>
            
            <input 
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>
          
          <!-- Google Sheets -->
          <div v-else-if="selectedMethod === 'google_sheets'" class="form-grid">
            <UFormGroup label="ID или ссылка Google Sheets" required>
              <UInput
                v-model="googleSheetsData.spreadsheetId"
                placeholder="1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0 или полная ссылка"
                :disabled="isImporting"
              />
              <template #help>
                Введите ID таблицы или вставьте полную ссылку из браузера
              </template>
            </UFormGroup>
            
            <UFormGroup label="Диапазон (опционально)">
              <UInput
                v-model="googleSheetsData.range"
                placeholder="A:Z"
                :disabled="isImporting"
              />
              <template #help>
                Например: A:Z, Лист1!A1:F100
              </template>
            </UFormGroup>
          </div>
          
          <!-- Sample link for testing -->
          <div v-if="selectedMethod === 'google_sheets'" class="import__sample">
            <UCard>
              <div class="flex items-center gap-3">
                <Icon name="heroicons:light-bulb" class="text-yellow-500" />
                <div>
                  <p class="font-medium">Хотите протестировать?</p>
                  <p class="text-sm text-gray-600 mt-1">
                    Используйте наш тестовый файл с образцами данных
                  </p>
                </div>
                <UButton
                  variant="outline"
                  size="sm"
                  @click="useSampleData"
                >
                  Использовать пример
                </UButton>
              </div>
            </UCard>
          </div>
          
          <!-- Actions -->
          <div class="import__actions">
            <UButton
              variant="outline"
              @click="goBack"
              :disabled="isImporting"
            >
              Назад
            </UButton>
            <UButton
              @click="startImport"
              :loading="isImporting"
              :disabled="!canImport"
            >
              {{ isImporting ? 'Импортируем...' : 'Начать импорт' }}
            </UButton>
          </div>
        </div>
        
        <!-- Progress -->
        <div v-if="isImporting" class="import__progress">
          <div class="import__progress-text">
            <span>Импорт данных...</span>
            <span>{{ importProgress }}%</span>
          </div>
          <UProgress :value="importProgress" />
        </div>
        
        <!-- Results -->
        <div v-if="importResult" class="import__results">
          <div class="import__results-header">
            <h2 class="import__results-title">Результаты импорта</h2>
            <UButton
              variant="outline"
              @click="resetImport"
              icon="heroicons:arrow-path"
            >
              Новый импорт
            </UButton>
          </div>
          
          <!-- Summary -->
          <div class="import__results-summary">
            <div class="import__summary-item">
              <div class="import__summary-value">
                {{ importResult.totalRows }}
              </div>
              <div class="import__summary-label">
                Всего строк
              </div>
            </div>
            
            <div class="import__summary-item">
              <div class="import__summary-value import__summary-value--success">
                {{ importResult.successfulImports }}
              </div>
              <div class="import__summary-label">
                Успешно
              </div>
            </div>
            
            <div class="import__summary-item">
              <div class="import__summary-value import__summary-value--error">
                {{ importResult.errors.length }}
              </div>
              <div class="import__summary-label">
                Ошибок
              </div>
            </div>
          </div>
          
          <!-- Errors -->
          <div v-if="importResult.errors.length > 0" class="import__errors">
            <div class="import__errors-title">
              <Icon name="heroicons:exclamation-triangle" />
              Ошибки импорта
            </div>
            
            <div class="import__error-list">
              <div 
                v-for="(error, index) in importResult.errors.slice(0, 10)"
                :key="index"
                class="import__error-item"
              >
                <div class="import__error-row">
                  Строка {{ error.row }}
                </div>
                <div class="import__error-messages">
                  {{ error.errors.join(', ') }}
                </div>
                <details v-if="error.data" class="import__error-details">
                  <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Показать данные строки
                  </summary>
                  <div class="import__error-data">
                    {{ JSON.stringify(error.data, null, 2) }}
                  </div>
                </details>
              </div>
              
              <div v-if="importResult.errors.length > 10" class="text-sm text-gray-500 text-center p-4">
                И еще {{ importResult.errors.length - 10 }} ошибок...
              </div>
            </div>
          </div>
          
          <!-- Success actions -->
          <div v-if="importResult.successfulImports > 0" class="import__actions">
            <UButton
              to="/products"
              icon="heroicons:eye"
            >
              Посмотреть продукты
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImportMethod, ImportResult } from '~/types';

// SEO Meta
definePageMeta({
  title: 'Импорт',
  description: 'Импорт продуктов из Excel, CSV или Google Sheets',
});

// Composables
const api = useApi();
const toast = useToast();

// State
const selectedMethod = ref<ImportMethod | null>(null);
const showForm = ref(false);
const isImporting = ref(false);
const importProgress = ref(0);
const importResult = ref<ImportResult | null>(null);
const uploadError = ref<string | null>(null);
const isDragOver = ref(false);

// File upload
const fileInputRef = ref<HTMLInputElement>();
const dropzoneRef = ref<HTMLElement>();
const selectedFile = ref<File | null>(null);

// Google Sheets data
const googleSheetsData = ref({
  spreadsheetId: '',
  range: 'A:Z',
});

// Import methods
const importMethods = [
  {
    type: 'file' as ImportMethod,
    icon: 'heroicons:document-arrow-up',
    title: 'Загрузить файл',
    description: 'Выберите Excel (.xlsx, .xls) или CSV файл с данными',
  },
  {
    type: 'google_sheets' as ImportMethod,
    icon: 'heroicons:table-cells',
    title: 'Google Sheets',
    description: 'Введите ID таблицы или вставьте полную ссылку',
  },
];

// Computed
const canImport = computed(() => {
  if (selectedMethod.value === 'file') {
    return !!selectedFile.value;
  }
  if (selectedMethod.value === 'google_sheets') {
    return !!googleSheetsData.value.spreadsheetId.trim();
  }
  return false;
});

// Methods
const selectMethod = (method: ImportMethod) => {
  selectedMethod.value = method;
  showForm.value = true;
  uploadError.value = null;
};

const getMethodTitle = (method: ImportMethod | null) => {
  const methodObj = importMethods.find(m => m.type === method);
  return methodObj?.title || '';
};

const goBack = () => {
  showForm.value = false;
  selectedMethod.value = null;
  selectedFile.value = null;
  uploadError.value = null;
  googleSheetsData.value = { spreadsheetId: '', range: 'A:Z' };
};

const resetImport = () => {
  importResult.value = null;
  importProgress.value = 0;
  goBack();
};

// File upload handlers
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleFile = (file: File) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Неподдерживаемый формат файла';
    selectedFile.value = null;
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    uploadError.value = 'Файл слишком большой (максимум 10MB)';
    selectedFile.value = null;
    return;
  }
  
  uploadError.value = null;
  selectedFile.value = file;
};

// Sample data
const useSampleData = () => {
  if (selectedMethod.value === 'google_sheets') {
    googleSheetsData.value.spreadsheetId = '1JSxXiuWX9dJEeUKGYUY4EsQ5wJln7acNr7UEpA20Ys0';
    googleSheetsData.value.range = 'A:Z';
  }
};

// Import
const startImport = async () => {
  if (!canImport.value) return;
  
  try {
    isImporting.value = true;
    importProgress.value = 0;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (importProgress.value < 90) {
        importProgress.value += Math.random() * 30;
      }
    }, 500);
    
    let result: ImportResult;
    
    if (selectedMethod.value === 'file' && selectedFile.value) {
      result = await api.importData.fromFile(selectedFile.value);
    } else if (selectedMethod.value === 'google_sheets') {
      result = await api.importData.fromGoogleSheets(
        googleSheetsData.value.spreadsheetId,
        googleSheetsData.value.range
      );
    } else {
      throw new Error('Неверный метод импорта');
    }
    
    clearInterval(progressInterval);
    importProgress.value = 100;
    
    importResult.value = result;
    
    // Show success message
    const message = result.errors.length > 0 
      ? `Импорт завершен с ошибками. Успешно: ${result.successfulImports}, Ошибок: ${result.errors.length}`
      : `Импорт успешно завершен! Добавлено продуктов: ${result.successfulImports}`;
    
    toast.add({
      title: 'Импорт завершен',
      description: message,
      color: result.errors.length > 0 ? 'yellow' : 'green',
    });
    
  } catch (error) {
    importProgress.value = 0;
    
    toast.add({
      title: 'Ошибка импорта',
      description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
      color: 'red',
    });
  } finally {
    isImporting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.import__error-details {
  margin-top: $spacing-2;
  
  summary {
    padding: $spacing-1 0;
    font-size: $font-size-sm;
  }
}

.form-grid {
  display: grid;
  gap: $spacing-4;
}

.import__sample {
  margin: $spacing-6 0;
}
</style>
