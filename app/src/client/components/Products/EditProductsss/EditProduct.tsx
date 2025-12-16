// EditProduct.tsx (USING EditSubscription SHELL + CLASSNAMES)

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputField, TextareaField } from '../../componenetsss/Inputs';
import EditPopup from '../../componenetsss/EditPopUp';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { ConfigurationTab } from './EditConfiguration';
import { configurationFields } from './EditConfiguration';
import EditReview from './EditReview';
import TopBar from '../../componenetsss/TopBar';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import EditButton from '../../componenetsss/EditButton';
import DeleteButton from '../../componenetsss/DeleteButton';
import UnsavedChangesModal from '../../componenetsss/UnsavedChangesModal';
import ProductIconPickerModal from '../ProductIconPickerModal';
import { ProductIconData } from '../ProductIcon';
import VerticalScrollbar from '../../componenetsss/VerticalScrollbar';
import MetricRow from '../../componenetsss/MetricRow';
import './EditProduct.css';
import { updateGeneralDetails, fetchGeneralDetails, updateConfiguration } from './EditProductApi';
import { finalizeProduct, deleteProduct, updateProductIcon } from '../api';
import { listAllProducts, getProducts } from '../api';
import '../../componenetsss/SkeletonForm.css';

interface Product {
  productId: string;
}

const steps = [
  { id: 1, title: 'General Details', desc: 'Start with the basics of your product.' },
  { id: 2, title: 'Configuration', desc: 'Define configuration and parameters.' },
  { id: 3, title: 'Review & Confirm', desc: 'Validate all details before finalizing.' },
];

interface EditProductProps {
  onClose: () => void;
  productId?: string;
  onIconUpdate?: (productId: string, iconData: any) => void;
}

type ActiveTab = 'general' | 'configuration' | 'review';

const EditProduct: React.FC<EditProductProps> = ({
  onClose,
  productId: propProductId,
  onIconUpdate,
}: EditProductProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: urlProductId } = useParams<{ id: string }>();

  // Use URL param if available, otherwise use prop
  const productId = urlProductId || propProductId;

  useEffect(() => {
    document.body.classList.add('edit-product-page');
    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [productType, setProductType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // icon state
  const [selectedIcon, setSelectedIcon] = useState<ProductIconData | null>(null);
  const [originalIcon, setOriginalIcon] = useState<ProductIconData | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    version: '',
    skuCode: '',
    description: '',
  });

  // CHANGE DETECTION SNAPSHOTS
  const originalFormDataRef = useRef<typeof formData | null>(null);
  const originalConfigRef = useRef<Record<string, string> | null>(null);

  const [existingProducts, setExistingProducts] = useState<
    Array<{ productName: string; skuCode: string }>
  >([]);
  const [originalValues, setOriginalValues] = useState<{ productName: string; skuCode: string }>(
    { productName: '', skuCode: '' },
  );
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        let data: any[] = [];
        try {
          data = await listAllProducts();
        } catch {
          try {
            data = await getProducts();
          } catch {
            data = [];
          }
        }
        const mapped = data.map(p => ({
          productName: (p as any).productName,
          skuCode: ((p as any).internalSkuCode ?? (p as any).skuCode ?? '') as string,
        }));
        setExistingProducts(mapped);
      } catch (e) {
        console.error('Failed to fetch existing products', e);
      }
    })();
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('editConfigFormData');
    return saved ? JSON.parse(saved) : {};
  });
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<import('./EditConfiguration').ConfigurationTabHandle>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const trimmed = value.trim();
    setFormData(prev => ({ ...prev, [field]: value }));
    setModifiedFields(prev => new Set(prev).add(field));

    if (field === 'productName') {
      const duplicate = existingProducts.some(p => {
        if (
          (p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() &&
          (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()
        )
          return false;
        return (p.productName || '').toLowerCase() === trimmed.toLowerCase();
      });
      if (duplicate) setErrors(prev => ({ ...prev, productName: 'Must be unique' }));
      else if (errors.productName === 'Must be unique') {
        const { productName, ...rest } = errors;
        setErrors(rest);
      }
    }

    if (field === 'skuCode') {
      const duplicate = existingProducts.some(p => {
        if (
          (p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() &&
          (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()
        )
          return false;
        return (p.skuCode || '').toLowerCase() === trimmed.toLowerCase();
      });
      if (duplicate) setErrors(prev => ({ ...prev, skuCode: 'Must be unique' }));
      else if (errors.skuCode === 'Must be unique') {
        const { skuCode, ...rest } = errors;
        setErrors(rest);
      }
    }

    if (errors[field] && errors[field] !== 'Must be unique') {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const lower = (s: string) => s.trim().toLowerCase();

    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.skuCode.trim()) newErrors.skuCode = 'SKU code is required';

    if (formData.productName && modifiedFields.has('productName')) {
      const isDuplicate = existingProducts.some(p => {
        if (
          lower(p.productName || '') === lower(originalValues.productName) &&
          lower(p.skuCode || '') === lower(originalValues.skuCode)
        )
          return false;
        return lower(p.productName || '') === lower(formData.productName);
      });
      if (isDuplicate) newErrors.productName = 'Must be unique';
    }

    if (formData.skuCode && modifiedFields.has('skuCode')) {
      const isDuplicate = existingProducts.some(p => {
        if (
          lower(p.productName || '') === lower(originalValues.productName) &&
          lower(p.skuCode || '') === lower(originalValues.skuCode)
        )
          return false;
        return lower(p.skuCode || '') === lower(formData.skuCode);
      });
      if (isDuplicate) newErrors.skuCode = 'Must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------- ICON CHANGE DETECTOR -------
  const hasIconChanged = () => {
    if (!originalIcon && !selectedIcon) return false;
    if (!originalIcon || !selectedIcon) return true;
    return (
      originalIcon.id !== selectedIcon.id ||
      originalIcon.svgPath !== selectedIcon.svgPath ||
      originalIcon.tileColor !== selectedIcon.tileColor ||
      JSON.stringify(originalIcon.outerBg) !== JSON.stringify(selectedIcon.outerBg)
    );
  };

  const hasEmptyRequiredFields = () => {
    if (activeTab === 'general') {
      return !formData.productName.trim() || !formData.skuCode.trim();
    }

    if (activeTab === 'configuration') {
      const currentProductType = configuration.productType || productType;
      if (!currentProductType) return true;

      const fields = configurationFields[currentProductType] || [];
      return fields.some((field: any) => {
        if (field.required) {
          const fieldValue = configuration[field.label] || '';
          return !fieldValue.trim();
        }
        return false;
      });
    }

    return false;
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (productId) {
      try {
        await deleteProduct(productId);
      } catch (e) {
        console.error('Failed to delete product', e);
      }
    }
    localStorage.removeItem('editConfigFormData');
    localStorage.removeItem('editConfigProductType');
    onClose();
    navigate('/get-started/products');
  };

  const handleSaveDraft = async () => {
    if (draftStatus === 'saving') return;
    try {
      setDraftStatus('saving');
      if (!productId) {
        setDraftStatus('idle');
        return;
      }

      const draftPayload = {
        productName: formData.productName,
        version: formData.version,
        internalSkuCode: formData.skuCode,
        productDescription: formData.description,
        status: 'DRAFT' as const,
      };
      await updateGeneralDetails(productId, draftPayload as any);

      if (hasIconChanged() && selectedIcon) {
        const iconResult = await updateProductIcon(productId, selectedIcon);
        if (iconResult.success) {
          setOriginalIcon(selectedIcon);
          onIconUpdate?.(productId, selectedIcon);
        }
      } else if (!selectedIcon && originalIcon) {
        const iconResult = await updateProductIcon(productId, null);
        if (iconResult.success) setOriginalIcon(null);
      }

      if (activeTab === 'configuration') {
        try {
          const productTypeChanged = localStorage.getItem('editConfigProductTypeChanged') === 'true';
          await updateConfiguration(productId, configuration.productType, configuration, productTypeChanged);
        } catch (configError) {
          console.error('Draft: configuration update failed:', configError);
        }
      }

      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 4000);
    } catch (err) {
      console.error('Save draft failed', err);
      setDraftStatus('idle');
      showToast?.({ kind: 'error', title: 'Failed to Save Draft', message: 'Please try again.' });
    }
  };

  const handleConfigChange = React.useCallback((config: Record<string, string>) => {
    setConfiguration(prev => {
      const updated = { ...prev, ...config };
      localStorage.setItem('editConfigFormData', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleProductTypeChange = (type: string) => {
    // When product type changes, start a fresh configuration object
    const updated = { productType: type } as Record<string, string>;
    setConfiguration(updated);
    localStorage.setItem('editConfigFormData', JSON.stringify(updated));

    setProductType(type);
    localStorage.setItem('editConfigProductType', type);
  };

  // Track scroll height for custom scrollbar
  useEffect(() => {
    const handleScroll = () => {
      if (formSectionRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = formSectionRef.current;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollHeight(scrollPercentage);
      }
    };

    const element = formSectionRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Sync configuration state when switching to review tab
  useEffect(() => {
    if (activeTab === 'review') {
      const latestConfigData = localStorage.getItem('editConfigFormData');
      if (latestConfigData) {
        try {
          const parsedConfig = JSON.parse(latestConfigData);
          setConfiguration(parsedConfig);
        } catch (e) {
          console.error('Failed to sync configuration data:', e);
        }
      }
    }
  }, [activeTab]);

  const goToStep = (index: number) => {
    const firstWord = steps[index].title.split(' ')[0].toLowerCase();
    const nextTab = (firstWord === 'general'
      ? 'general'
      : firstWord === 'configuration'
        ? 'configuration'
        : 'review') as ActiveTab;

    // When leaving General, enforce required-field validation (productName, skuCode)
    if (activeTab === 'general' && nextTab !== 'general') {
      const ok = validateForm();
      if (!ok) return; // stay on General tab and show errors
    }

    setCurrentStep(index);

    if (nextTab === 'review') {
      const latestConfigData = localStorage.getItem('editConfigFormData');
      if (latestConfigData) {
        try {
          const parsedConfig = JSON.parse(latestConfigData);
          setConfiguration(parsedConfig);
        } catch (e) {
          console.error('Failed to parse latest config data:', e);
        }
      }
    }

    setActiveTab(nextTab);
  };

  // --------- CHANGE DETECTION (fixed) ----------
  const shallowEqual = (a: any, b: any) => {
    const keys = new Set<string>([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) {
      if ((a as any)[k] !== (b as any)[k]) return false;
    }
    return true;
  };

  const normalizeConfigsForCompare = (origCfg: Record<string, string> | null, currCfg: Record<string, string>) => {
    const typeChanged = localStorage.getItem('editConfigProductTypeChanged') === 'true';
    const o = { ...(origCfg || {}) };
    const c = { ...(currCfg || {}) };
    if (!typeChanged) {
      delete (o as any).productType;
      delete (c as any).productType;
    }
    return { o, c };
  };

  const hasPendingChanges = () => {
    const origForm = originalFormDataRef.current;
    const origCfg = originalConfigRef.current;

    if (!origForm || !origCfg) return false;

    const formChanged = !shallowEqual(origForm, formData);
    const { o, c } = normalizeConfigsForCompare(origCfg, configuration);
    const cfgChanged = !shallowEqual(o, c);

    return formChanged || cfgChanged;
  };

  const saveAllChanges = async (
    { includeGeneral = true, includeConfig = true }: { includeGeneral?: boolean; includeConfig?: boolean } = {},
  ): Promise<boolean> => {
    if (!hasPendingChanges() && !hasIconChanged() && !isDraft) return false;

    try {
      setLoading(true);

      const { getAuthData } = await import('../../../utils/auth');
      const authData = getAuthData();
      if (!authData?.token) throw new Error('No authentication token found');
      if (!productId) throw new Error('Product ID is required for updating');

      if (includeGeneral) {
        const generalDetailsPayload = {
          productName: formData.productName?.trim() || '',
          version: formData.version?.trim() || '',
          internalSkuCode: formData.skuCode?.trim() || '',
          productDescription: formData.description?.trim() || '',
          status: isDraft ? 'DRAFT' : 'ACTIVE',
          productType: configuration.productType || productType || '',
          lastUpdated: new Date().toISOString(),
        };
        await updateGeneralDetails(productId, generalDetailsPayload);
      }

      if (hasIconChanged() && productId) {
        const iconResult = await updateProductIcon(productId, selectedIcon);
        if (iconResult.success) {
          setOriginalIcon(selectedIcon || null);
          onIconUpdate?.(productId, selectedIcon || null);

          if (selectedIcon) {
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            iconCache[productId] = JSON.stringify({ iconData: selectedIcon });
            localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
          } else {
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            delete iconCache[productId];
            localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
          }

          localStorage.setItem('productUpdated', Date.now().toString());
        }
      }

      if (includeConfig && configuration.productType && productId) {
        const { o, c } = normalizeConfigsForCompare(originalConfigRef.current, configuration);
        const hasConfigChanges = !shallowEqual(o, c);
        if (hasConfigChanges) {
          try {
            const productTypeChanged = localStorage.getItem('editConfigProductTypeChanged') === 'true';
            await updateConfiguration(productId, configuration.productType, configuration, productTypeChanged);
          } catch (configError) {
            console.error('Configuration update failed:', configError);
          }
        }
      }

      if (isDraft && productId) await finalizeProduct(productId);

      originalFormDataRef.current = { ...formData };
      originalConfigRef.current = { ...configuration };

      localStorage.removeItem('editConfigFormData');
      localStorage.removeItem('editConfigProductType');

      return true;
    } catch (err) {
      console.error('Update failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'general') {
      if (!validateForm()) return;
      goToStep(1);
      return;
    }

    if (activeTab === 'configuration') {
      // Run configuration tab validation via the exposed submit() method.
      // Only proceed to the Review step if submit() returns true.
      const ok = await configRef.current?.submit();
      if (!ok) return;
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
      const changesExist = hasPendingChanges() || hasIconChanged() || isDraft;
      if (!changesExist) {
        onClose();
        return;
      }
      const success = await saveAllChanges();
      if (success) {
        showToast({ kind: 'success', title: 'Changes Saved', message: 'Product updated successfully.' });
        onClose();
      } else {
        showToast({
          kind: 'error',
          title: 'Failed to Save Changes',
          message: 'Could not update product. Please try again.',
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  // Prefill and set snapshots (ORDER FIX + RESTORED ICON FALLBACK)
  useEffect(() => {
    const fetchDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);

        localStorage.removeItem('editConfigFormData');
        localStorage.removeItem('editConfigProductType');
        localStorage.removeItem('editConfigFetchedData');
        localStorage.removeItem('editConfigModifiedFields');
        localStorage.removeItem('editConfigProductTypeChanged');

        const data = await fetchGeneralDetails(productId);

        const originalProductName = data.productName ?? '';
        const originalSkuCode = data.internalSkuCode ?? '';

        const nextForm = {
          productName: originalProductName,
          version: data.version ?? '',
          skuCode: originalSkuCode,
          description: data.productDescription ?? '',
        };
        setFormData(nextForm);

        // ---------- Load product icon ----------
        try {
          let hasStructuredIconData = false;

          // PRIORITY 0: localStorage cache
          try {
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            const cachedIconJson = iconCache[productId];
            if (cachedIconJson) {
              const parsedCache =
                typeof cachedIconJson === 'string' ? JSON.parse(cachedIconJson) : cachedIconJson;
              if (parsedCache?.iconData) {
                setSelectedIcon(parsedCache.iconData as ProductIconData);
                setOriginalIcon(parsedCache.iconData as ProductIconData);
                hasStructuredIconData = true;
              } else if (parsedCache?.id && parsedCache?.svgPath) {
                setSelectedIcon(parsedCache as ProductIconData);
                setOriginalIcon(parsedCache as ProductIconData);
                hasStructuredIconData = true;
              }
            }
          } catch (cacheErr) {
            console.warn('EditProduct: Failed to read icon cache from localStorage:', cacheErr);
          }

          // PRIORITY 1: structured JSON in productIcon
          if (!hasStructuredIconData && data.productIcon) {
            const parsed = JSON.parse(data.productIcon);
            if (parsed?.iconData) {
              setSelectedIcon(parsed.iconData as ProductIconData);
              setOriginalIcon(parsed.iconData as ProductIconData);
              hasStructuredIconData = true;
            } else if (parsed?.id) {
              setSelectedIcon(parsed as ProductIconData);
              setOriginalIcon(parsed as ProductIconData);
              hasStructuredIconData = true;
            }
          }
          // PRIORITY 2: direct iconData
          else if (data.iconData) {
            setSelectedIcon(data.iconData as ProductIconData);
            setOriginalIcon(data.iconData as ProductIconData);
            hasStructuredIconData = true;
          }

          // PRIORITY 3: reconstruct from SVG file path
          if (
            !hasStructuredIconData &&
            data.icon &&
            typeof data.icon === 'string' &&
            data.icon.includes('/uploads/')
          ) {
            const resolveIconUrl = (icon: string) => {
              if (icon.startsWith('http') || icon.startsWith('data:')) return icon;
              const BASE_URL = 'http://3.208.93.68:8080/api';
              if (icon.startsWith('/uploads')) {
                const serverBase = BASE_URL.replace('/api', '');
                return `${serverBase}${icon}`;
              }
              const leadingSlash = icon.startsWith('/') ? '' : '/';
              return `${BASE_URL}${leadingSlash}${icon}`;
            };

            const fetchIconWithAuth = async (iconPath: string): Promise<string | null> => {
              const resolved = resolveIconUrl(iconPath);
              if (!resolved) return null;
              try {
                const axios = (await import('axios')).default;
                const { getAuthHeaders } = await import('../../../utils/auth');
                const authHeaders = getAuthHeaders();

                const cacheBustUrl = resolved.includes('?')
                  ? `${resolved}&_cb=${Date.now()}`
                  : `${resolved}?_cb=${Date.now()}`;

                const response = await axios.get(cacheBustUrl, {
                  responseType: 'blob',
                  headers: authHeaders,
                });

                return URL.createObjectURL(response.data);
              } catch (e: any) {
                if (e?.response?.status === 500) console.warn(`Icon not available on server: ${iconPath}`);
                else console.warn(`Failed to fetch icon: ${iconPath}`, e);
                return null;
              }
            };

            try {
              const iconUrl = await fetchIconWithAuth(data.icon);
              if (iconUrl) {
                const svgResponse = await fetch(iconUrl);
                const svgText = await svgResponse.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');

                const rects = doc.querySelectorAll('rect');
                let tileColor = '#0F6DDA';
                for (const rect of Array.from(rects)) {
                  const width = rect.getAttribute('width');
                  const fill = rect.getAttribute('fill');
                  if (width && fill && fill.startsWith('#')) {
                    const w = parseFloat(width);
                    if (w > 29 && w < 30) {
                      tileColor = fill;
                      break;
                    }
                  }
                }

                const pathElement =
                  doc.querySelector('path[fill="#FFFFFF"]') || doc.querySelector('path');
                let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z';
                let viewBox = '0 0 24 24';
                if (pathElement) {
                  svgPath = pathElement.getAttribute('d') || svgPath;
                  const svgEl = pathElement.closest('svg');
                  if (svgEl) viewBox = svgEl.getAttribute('viewBox') || viewBox;
                }

                let outerBg: [string, string] | undefined;
                const gradientElement = doc.querySelector('linearGradient');
                if (gradientElement) {
                  const stops = gradientElement.querySelectorAll('stop');
                  if (stops.length >= 2) {
                    const color1 = stops[0].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                    const color2 = stops[1].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                    if (color1 && color2) outerBg = [color1.trim(), color2.trim()];
                  }
                }

                const reconstructedIcon: ProductIconData = {
                  id: `reconstructed-${Date.now()}`,
                  label: 'Reconstructed Icon',
                  svgPath,
                  viewBox,
                  tileColor,
                  ...(outerBg && { outerBg }),
                };

                setSelectedIcon(reconstructedIcon);
                setOriginalIcon(reconstructedIcon);
              }
            } catch (fetchErr) {
              console.warn('EditProduct: Failed to reconstruct SVG:', fetchErr);
            }
          }
        } catch (err) {
          console.warn('Icon parse failed:', err);
        }

        // ----- set product type FIRST so snapshots include it -----
        const savedProductType = localStorage.getItem('editConfigProductType');
        if (savedProductType) {
          setProductType(savedProductType);
          setConfiguration(prev => ({ ...prev, productType: savedProductType }));
        } else if (data.productType) {
          setProductType(data.productType);
          handleProductTypeChange(data.productType);
        }

        originalFormDataRef.current = { ...nextForm };

        const fetchedConfig = (() => {
          try {
            const s = localStorage.getItem('editConfigFetchedData');
            return s ? JSON.parse(s) : {};
          } catch {
            return {};
          }
        })();
        const currentConfig = (() => {
          try {
            const s = localStorage.getItem('editConfigFormData');
            return s ? JSON.parse(s) : {};
          } catch {
            return {};
          }
        })();

        originalConfigRef.current = Object.keys(fetchedConfig).length ? fetchedConfig : currentConfig;

        setOriginalValues({ productName: originalProductName, skuCode: originalSkuCode });
        setIsDraft((data.status ?? '').toUpperCase() === 'DRAFT');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  return (
    <>
      <TopBar
        title={productId ? `Edit ${formData.productName || 'Product'}` : 'Create New Product'}
        onBack={() => {
          if (hasEmptyRequiredFields()) {
            setShowUnsavedChangesModal(true);
            return;
          }

          const hasChanges = hasPendingChanges() || hasIconChanged() || isDraft;
          if (hasChanges) setShowSaveDraftModal(true);
          else onClose();
        }}
      />

      {/* === SHELL: EXACTLY LIKE EditSubscription (editsub-np-*) === */}
      <div className="editsub-np-viewport">
        <div className="editsub-np-card">
          <div className="editsub-np-grid">
            {/* Sidebar / rail */}
            <aside className="editsub-np-rail">
              <nav className="editsub-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <MetricRow
                      key={step.id}
                      title={step.title}
                      state={isActive ? 'active' : 'default'}
                      className={['editsub-np-step', isActive ? 'active' : '', isCompleted ? 'completed' : '']
                        .join(' ')
                        .trim()}
                      onClick={async () => {
                        // If user is on Configuration and clicks Review & Confirm, validate config first
                        const isReviewStep = step.id === 3;
                        if (isReviewStep && activeTab === 'configuration') {
                          const ok = await configRef.current?.submit();
                          if (!ok) return;
                        }
                        goToStep(index);
                      }}
                    />
                  );
                })}
              </nav>
            </aside>

            {/* Main content area */}
            <main className="editsub-np-main">
              <div className="editsub-np-main__inner">
                <div className="editsub-np-body">
                  <form className="editsub-np-form" onSubmit={e => e.preventDefault()}>
                    <div className="editsub-np-form-section" ref={formSectionRef}>
                      {/* GENERAL */}
                      {activeTab === 'general' && (
                        <div className="edit-np-section">
                          <div className="edit-np-form-row">
                            <div className="edit-np-form-group">
                              <InputField
                                label="Product Name"
                                value={formData.productName}
                                onChange={(val: string) => handleInputChange('productName', val)}
                                placeholder="eg. Google Maps API"
                                error={errors.productName}
                                required
                              />
                            </div>

                            <div className="edit-np-form-group">
                              <InputField
                                label="Version"
                                value={formData.version}
                                onChange={(val: string) => handleInputChange('version', val)}
                                placeholder="eg., 2.3-VOS"
                              />
                            </div>
                          </div>

                          {/* Product Icon Field - No Icon */}
                          {!selectedIcon && (
                            <div className="edit-np-form-group">
                              <label className="edit-np-label">
                                Product Icon 
                              </label>

                              <div className="prod-np-icon-field-wrapper">
                                <div className="prod-np-icon-placeholder">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                                    <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" fill="#F8F7FA" />
                                    <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" stroke="#BFBECE" strokeWidth="1.05" />
                                    <path d="M28 25.1996C31.866 25.1996 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.1996 28 25.1996Z" stroke="#909599" strokeWidth="2.1" />
                                    <path d="M28.0008 43.4008C34.1864 43.4008 39.2008 40.5802 39.2008 37.1008C39.2008 33.6214 34.1864 30.8008 28.0008 30.8008C21.8152 30.8008 16.8008 33.6214 16.8008 37.1008C16.8008 40.5802 21.8152 43.4008 28.0008 43.4008Z" stroke="#909599" strokeWidth="2.1" />
                                  </svg>
                                </div>

                                <span className="prod-np-icon-placeholder-text">Add product icon</span>

                                <button
                                  type="button"
                                  className="prod-np-icon-add-btn"
                                  onClick={() => setIsIconPickerOpen(true)}
                                >
                                  <span>+ Add</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Product Icon Field - Icon Selected */}
                          {selectedIcon &&
                            (() => {
                              const extractDisplayColor = (colorStr: string): string => {
                                if (!colorStr) return '#CC9434';
                                const match = colorStr.match(/var\([^,]+,\s*([^)]+)\)/);
                                return match ? match[1].trim() : colorStr;
                              };

                              const outerBg1 = extractDisplayColor(selectedIcon.outerBg?.[0] || '#F8F7FA');
                              const outerBg2 = extractDisplayColor(selectedIcon.outerBg?.[1] || '#E4EEF9');
                              const tileColor = extractDisplayColor(selectedIcon.tileColor || '#CC9434');

                              return (
                                <div className="edit-np-form-group">
                                  <label className="edit-np-label">
                                    Product Icon
                                  </label>

                                  <div className="prod-np-icon-field-wrapper">
                                    <div className="prod-np-icon-preview">
                                      <div
                                        style={{
                                          width: 50.6537,
                                          height: 46.3351,
                                          borderRadius: 12,
                                          border: '0.6px solid var(--border-border-2, #D5D4DF)',
                                          background: `
                                            linear-gradient(0deg, rgba(1,69,118,0.10) 0%, rgba(1,69,118,0.10) 100%),
                                            linear-gradient(135deg, ${outerBg1}, ${outerBg2}),
                                            radial-gradient(110% 110% at 85% 85%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 60%)
                                          `,
                                          display: 'flex',
                                          padding: 8,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          position: 'relative',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: 'absolute',
                                            left: 10.5,
                                            top: 8.2,
                                            width: 29.45,
                                            height: 25.243,
                                            borderRadius: 5.7,
                                            background: tileColor,
                                          }}
                                        />

                                        <div
                                          style={{
                                            width: 29.339,
                                            height: 26.571,
                                            padding: '1.661px 3.321px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 2.214,
                                            flexShrink: 0,
                                            borderRadius: 6,
                                            border: '0.6px solid #FFF',
                                            background: 'rgba(202, 171, 213, 0.10)',
                                            backdropFilter: 'blur(3.875px)',
                                            transform: 'translate(3px, 2px)',
                                            boxShadow: 'inset 0 1px 8px rgba(255,255,255,0.35)',
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox={selectedIcon.viewBox ?? '0 0 18 18'}
                                            fill="none"
                                            style={{ flexShrink: 0, aspectRatio: '1 / 1', display: 'block' }}
                                          >
                                            <path d={selectedIcon.svgPath} fill="#FFFFFF" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="prod-np-icon-actions">
                                      <EditButton onClick={() => setIsIconPickerOpen(true)} label="Edit" />
                                      <DeleteButton onClick={() => setSelectedIcon(null)} label="Remove" variant="soft" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                          <ProductIconPickerModal
                            isOpen={isIconPickerOpen}
                            onClose={() => setIsIconPickerOpen(false)}
                            onSelect={icon => {
                              setSelectedIcon(icon);
                              setIsIconPickerOpen(false);
                            }}
                            maxCombosPerIcon={24}
                          />

                          <div className="edit-np-form-group">
                            <InputField
                              label="SKU Code"
                              value={formData.skuCode}
                              onChange={(val: string) => handleInputChange('skuCode', val)}
                              placeholder="SKU-96"
                              error={errors.skuCode}
                              required
                            />
                          </div>

                          <div className="edit-np-form-group">
                            <TextareaField
                              label="Description"
                              value={formData.description}
                              onChange={(val: string) => handleInputChange('description', val)}
                              placeholder="eg. API for mapping applications."
                            />
                          </div>
                        </div>
                      )}

                      {/* CONFIGURATION */}
                      {activeTab === 'configuration' && (
                        <div className="edit-np-section">
                          <div className="edit-np-configuration-tab">
                            <ConfigurationTab
                              initialProductType={productType}
                              onConfigChange={handleConfigChange}
                              onProductTypeChange={handleProductTypeChange}
                              ref={configRef}
                              productId={productId ?? formData.skuCode}
                            />
                          </div>
                        </div>
                      )}

                      {/* REVIEW */}
                      {activeTab === 'review' && (
                        <div className="edit-np-section">
                          <div className="edit-np-review-container">
                            <EditReview generalDetails={formData} configuration={configuration} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Custom Scrollbar (kept same logic, class renamed to editsub-*) */}
                    {formSectionRef.current &&
                      formSectionRef.current.scrollHeight > formSectionRef.current.clientHeight && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: `${scrollHeight}%`,
                            transition: 'top 0.1s ease-out',
                            pointerEvents: 'none',
                          }}
                        >
                          <VerticalScrollbar
                            height={`${
                              (formSectionRef.current.clientHeight / formSectionRef.current.scrollHeight) * 100
                            }%`}
                            color="#C3C2D0"
                            thickness={4}
                            className="editsub-scrollbar-custom"
                          />
                        </div>
                      )}

                    <div className="af-skel-rule af-skel-rule--bottom" />

                    {/* Footer (EditSubscription classnames) */}
                    <div className="editsub-np-form-footer">
                      <div className="editsub-np-btn-group editsub-np-btn-group--back">
                        {activeTab !== 'general' && (
                          <SecondaryButton type="button" onClick={handlePreviousStep}>
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editsub-np-btn-group editsub-np-btn-group--next">
                        <PrimaryButton type="button" onClick={handleNextStep} disabled={loading}>
                          {loading ? '' : activeTab === 'review' ? (isDraft ? 'Finalize Product' : 'Save Changes') : 'Save & Next'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="af-skel-rule af-skel-rule--bottom" />
            </main>
          </div>
        </div>
      </div>

      {/* Save draft popup */}
      <EditPopup
        isOpen={showSaveDraftModal}
        onClose={() => {
          localStorage.removeItem('editConfigFormData');
          localStorage.removeItem('editConfigProductType');
          setShowSaveDraftModal(false);
          onClose();
        }}
        onDismiss={() => setShowSaveDraftModal(false)}
        onSave={async () => {
          if (!validateForm()) {
            setShowSaveDraftModal(false);
            return;
          }
          setShowSaveDraftModal(false);

          if (!hasPendingChanges() && !hasIconChanged() && !isDraft) {
            onClose();
            return;
          }

          const success = await saveAllChanges({
            includeGeneral: true,
            includeConfig: activeTab !== 'general',
          });

          if (success) {
            showToast({ kind: 'success', title: 'Changes Saved', message: 'Product updated successfully.' });
            onClose();
          } else {
            showToast({
              kind: 'error',
              title: 'Failed to Save Changes',
              message: 'Could not update product. Please try again.',
            });
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        productName={formData.productName || 'this product'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showUnsavedChangesModal && (
        <UnsavedChangesModal
          onDiscard={() => {
            setShowUnsavedChangesModal(false);
            onClose();
          }}
          onKeepEditing={() => setShowUnsavedChangesModal(false)}
          onClose={() => setShowUnsavedChangesModal(false)}
        />
      )}
    </>
  );
};

export default EditProduct;
