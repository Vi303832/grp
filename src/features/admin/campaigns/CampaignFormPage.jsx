import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PageHeader,
  TextField,
  TextareaField,
  SelectField,
  FormField,
} from '../components';
import { Button, Card, CardBody, Spinner } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import {
  campaignSchema,
  DEFAULT_VALUES,
  slugify,
  newPackageId,
} from './campaignSchema';
import {
  useAdminCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  isSlugAvailable,
} from './useAdminCampaigns';
import { useCategories } from '../../campaigns/hooks/useCategories';
import { useCities } from '../../campaigns/hooks/useCities';
import { useBusinesses } from './useBusinesses';
import CampaignImageUploader from './CampaignImageUploader';
import StringListField from './StringListField';

function toDateInputValue(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const TABS = [
  { id: 'basic', label: 'Temel', icon: 'info' },
  { id: 'packages', label: 'Paketler', icon: 'inventory_2' },
  { id: 'content', label: 'İçerik', icon: 'article' },
  { id: 'location', label: 'Konum & Ödeme', icon: 'location_on' },
  { id: 'media', label: 'Görseller', icon: 'image' },
  { id: 'publish', label: 'Yayın', icon: 'publish' },
];

function TabBar({ active, onChange, errors, images }) {
  // Hangi sekmede hata var?
  const tabErrors = {
    basic: ['title', 'slug', 'shortDescription', 'description', 'businessId', 'cityId', 'categoryId'].some(
      (k) => !!errors?.[k],
    ),
    packages: !!errors?.packages,
    content: ['highlights', 'included', 'notIncluded', 'howToUse', 'terms', 'faq', 'cancellation'].some(
      (k) => !!errors?.[k],
    ),
    location: !!errors?.location || !!errors?.paymentInfo,
    media: images?.length === 0,
    publish: !!errors?.expiresAt,
  };

  return (
    <div className="sticky top-0 z-10 -mx-1 overflow-x-auto border-b border-outline-variant bg-surface/95 px-1 backdrop-blur">
      <div className="flex min-w-max gap-1 py-2">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const hasErr = tabErrors[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high',
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.icon}
              </span>
              {t.label}
              {hasErr && (
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                    isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-error/15 text-error',
                  )}
                >
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CampaignFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: existing, isLoading: loadingExisting } = useAdminCampaign(id);
  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  const { data: businesses } = useBusinesses();

  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  const [images, setImages] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const packages = useFieldArray({ control, name: 'packages' });
  const faq = useFieldArray({ control, name: 'faq' });

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const packagesValue = watch('packages');

  // Edit modunda formu mevcut verilerle doldur
  useEffect(() => {
    if (isEdit && existing) {
      reset({
        title: existing.title ?? '',
        slug: existing.slug ?? '',
        shortDescription: existing.shortDescription ?? '',
        description: existing.description ?? '',
        businessId: existing.businessId ?? '',
        cityId: existing.cityId ?? 'bursa',
        categoryId: existing.categoryId ?? '',
        packages:
          existing.packages?.length > 0
            ? existing.packages.map((p) => ({
                id: p.id ?? newPackageId(),
                name: p.name ?? '',
                description: p.description ?? '',
                price: p.price ?? 0,
                originalPrice: p.originalPrice ?? 0,
                quota: p.quota ?? 0,
                soldCount: p.soldCount ?? 0,
                isDefault: p.isDefault ?? false,
              }))
            : [
                {
                  id: newPackageId(),
                  name: 'Standart Paket',
                  description: '',
                  price: existing.price ?? 0,
                  originalPrice: existing.originalPrice ?? 0,
                  quota: existing.quota ?? 0,
                  soldCount: existing.soldCount ?? 0,
                  isDefault: true,
                },
              ],
        highlights: existing.highlights ?? [],
        included: existing.included ?? [],
        notIncluded: existing.notIncluded ?? [],
        howToUse: existing.howToUse ?? [],
        terms: existing.terms ?? '',
        faq: existing.faq ?? [],
        cancellation: existing.cancellation ?? '',
        location: {
          address: existing.location?.address ?? '',
          district: existing.location?.district ?? '',
          phone: existing.location?.phone ?? '',
          workingHours: existing.location?.workingHours ?? '',
          mapUrl: existing.location?.mapUrl ?? '',
        },
        paymentInfo: {
          maxInstallments: existing.paymentInfo?.maxInstallments ?? 3,
          installmentNote: existing.paymentInfo?.installmentNote ?? '',
        },
        isActive: existing.isActive ?? true,
        isFeatured: existing.isFeatured ?? false,
        expiresAt: toDateInputValue(existing.expiresAt),
      });
      setImages(existing.images ?? []);
      setSlugTouched(true);
    }
  }, [isEdit, existing, reset]);

  useEffect(() => {
    if (!slugTouched && !isEdit && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, slugTouched, isEdit, setValue]);

  const onInvalid = (errs) => {
    // Validation hatası varsa ilgili sekmeye atla
    const firstErrorKey = Object.keys(errs)[0];
    const tabMap = {
      title: 'basic',
      slug: 'basic',
      shortDescription: 'basic',
      description: 'basic',
      businessId: 'basic',
      cityId: 'basic',
      categoryId: 'basic',
      packages: 'packages',
      highlights: 'content',
      included: 'content',
      notIncluded: 'content',
      howToUse: 'content',
      terms: 'content',
      faq: 'content',
      cancellation: 'content',
      location: 'location',
      paymentInfo: 'location',
      expiresAt: 'publish',
    };
    if (firstErrorKey && tabMap[firstErrorKey]) {
      setActiveTab(tabMap[firstErrorKey]);
    }
    toast.error('Form eksik ya da hatalı, işaretli sekmeyi kontrol edin.');
  };

  const onSubmit = async (values) => {
    if (images.length === 0) {
      setActiveTab('media');
      toast.error('En az bir kampanya görseli eklemelisiniz.');
      return;
    }

    const slugFree = await isSlugAvailable(values.slug, isEdit ? id : null);
    if (!slugFree) {
      setActiveTab('basic');
      toast.error('Bu slug zaten kullanılıyor. Farklı bir slug seçin.');
      return;
    }

    // Tek bir default paket garantisi
    const hasDefault = values.packages.some((p) => p.isDefault);
    if (!hasDefault) {
      values.packages[0].isDefault = true;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id,
          values,
          images,
          existingPackages: existing?.packages ?? [],
        });
        toast.success('Kampanya güncellendi.');
      } else {
        await createMutation.mutateAsync({ values, images });
        toast.success('Kampanya oluşturuldu.');
      }
      navigate('/admin/kampanyalar');
    } catch (err) {
      toast.error(`Kaydedilemedi: ${err.message}`);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  // Radio button ile tek default paket seçimi
  const setDefaultPackage = (index) => {
    packagesValue.forEach((_, i) => {
      setValue(`packages.${i}.isDefault`, i === index, { shouldDirty: true });
    });
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Kampanyayı Düzenle' : 'Yeni Kampanya'}
        description={
          isEdit
            ? 'Kampanya bilgilerini güncelleyin.'
            : 'Yeni bir kampanya oluşturun.'
        }
        actions={
          <Link
            to="/admin/kampanyalar"
            className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Listeye dön
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          errors={errors}
          images={images}
        />

        <div className="mt-6 space-y-6 pb-24">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardBody className="space-y-4">
                    <TextField
                      label="Başlık"
                      required
                      placeholder="Bursa Central Spa'da 60 dk Klasik Masaj"
                      error={errors.title?.message}
                      {...register('title')}
                    />
                    <TextField
                      label="Slug (URL)"
                      required
                      hint="SEO uyumlu URL. Başlıktan otomatik üretilir."
                      placeholder="bursa-central-spa-klasik-masaj"
                      error={errors.slug?.message}
                      {...register('slug', {
                        onChange: () => setSlugTouched(true),
                      })}
                    />
                    <TextareaField
                      label="Kısa Açıklama"
                      required
                      rows={2}
                      hint="Kartlarda ve detay sayfasının başında gösterilen 1-2 satırlık özet (max 200 karakter)."
                      placeholder="Merkez Bursa'da lüks spa keyfi — 60 dakika İsveç masajı, havlu ve bitki çayı dahil."
                      error={errors.shortDescription?.message}
                      {...register('shortDescription')}
                    />
                    <TextareaField
                      label="Uzun Açıklama"
                      required
                      rows={8}
                      hint="Kampanyanın detaylı anlatımı. Satır sonları korunur."
                      error={errors.description?.message}
                      {...register('description')}
                    />
                  </CardBody>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardBody className="space-y-4">
                    <h3 className="text-sm font-semibold text-on-surface">
                      Kategorilendirme
                    </h3>
                    <SelectField
                      label="İşletme"
                      required
                      error={errors.businessId?.message}
                      {...register('businessId')}
                    >
                      <option value="">Seçin…</option>
                      {(businesses ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField
                      label="Şehir"
                      required
                      error={errors.cityId?.message}
                      {...register('cityId')}
                    >
                      <option value="">Seçin…</option>
                      {(cities ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField
                      label="Kategori"
                      required
                      error={errors.categoryId?.message}
                      {...register('categoryId')}
                    >
                      <option value="">Seçin…</option>
                      {(categories ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectField>

                    {slugValue && (
                      <FormField label="URL Önizleme">
                        <code className="rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                          /kampanya/{slugValue}
                        </code>
                      </FormField>
                    )}
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <Card>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">
                      Paket Seçenekleri
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      En az bir paket eklemelisiniz. Varsayılan paket
                      kartlarda/listelerde gösterilir.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      packages.append({
                        id: newPackageId(),
                        name: '',
                        description: '',
                        price: 0,
                        originalPrice: 0,
                        quota: 0,
                        isDefault: packagesValue.length === 0,
                      })
                    }
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      add
                    </span>
                    Paket Ekle
                  </Button>
                </div>

                {errors.packages?.message && (
                  <p className="text-xs text-error">{errors.packages.message}</p>
                )}

                <div className="space-y-3">
                  {packages.fields.map((field, index) => {
                    const pkgErrors = errors.packages?.[index];
                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-on-surface">
                            <input
                              type="radio"
                              checked={!!packagesValue[index]?.isDefault}
                              onChange={() => setDefaultPackage(index)}
                              className="h-4 w-4 border-outline-variant text-primary focus:ring-primary/40"
                            />
                            Varsayılan paket
                          </label>
                          {packages.fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => packages.remove(index)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-error hover:bg-error-container/20"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                              Sil
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <TextField
                            label="Paket Adı"
                            required
                            placeholder="1 Kişilik Klasik Masaj"
                            error={pkgErrors?.name?.message}
                            {...register(`packages.${index}.name`)}
                          />
                          <TextField
                            type="number"
                            label="Kota"
                            hint="0 = sınırsız"
                            error={pkgErrors?.quota?.message}
                            {...register(`packages.${index}.quota`)}
                          />
                          <TextField
                            type="number"
                            step="0.01"
                            label="Satış Fiyatı (₺)"
                            required
                            error={pkgErrors?.price?.message}
                            {...register(`packages.${index}.price`)}
                          />
                          <TextField
                            type="number"
                            step="0.01"
                            label="Orijinal Fiyat (₺)"
                            required
                            error={pkgErrors?.originalPrice?.message}
                            {...register(`packages.${index}.originalPrice`)}
                          />
                          <TextareaField
                            className="md:col-span-2"
                            label="Paket Açıklaması"
                            rows={2}
                            placeholder="Örn. 60 dk İsveç masajı, havlu dahil"
                            error={pkgErrors?.description?.message}
                            {...register(`packages.${index}.description`)}
                          />
                        </div>

                        {isEdit && field.soldCount > 0 && (
                          <p className="mt-2 text-xs text-on-surface-variant">
                            Satılan: <b>{field.soldCount}</b> adet (bu değer admin
                            panelinden değiştirilemez).
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'content' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardBody className="space-y-6">
                  <Controller
                    control={control}
                    name="highlights"
                    render={({ field, fieldState }) => (
                      <StringListField
                        label="Öne Çıkanlar"
                        hint="Kampanya detayında rozet/madde halinde listelenir."
                        placeholder="Örn. 60 dk süre"
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        max={10}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="included"
                    render={({ field, fieldState }) => (
                      <StringListField
                        label="Dahil Olanlar"
                        placeholder="Örn. Havlu, bornoz"
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="notIncluded"
                    render={({ field, fieldState }) => (
                      <StringListField
                        label="Dahil Olmayanlar"
                        placeholder="Örn. Kişisel bakım ürünleri"
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="howToUse"
                    render={({ field, fieldState }) => (
                      <StringListField
                        label="Nasıl Kullanılır?"
                        hint="Adım adım listelenir."
                        placeholder="1. Kupon kodunu al"
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        max={10}
                      />
                    )}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-6">
                  <TextareaField
                    label="Koşullar & Kurallar"
                    rows={6}
                    hint="Satın alma/kullanım kuralları."
                    placeholder="• Kupon rezervasyonla kullanılır.
• Randevu değişikliği 24 saat öncesinden yapılmalıdır.
• Hafta sonu geçerlidir."
                    error={errors.terms?.message}
                    {...register('terms')}
                  />
                  <TextareaField
                    label="İptal & İade Politikası"
                    rows={4}
                    hint="Müşteri kuponu iade edebilir mi? Koşulları nedir?"
                    placeholder="Satın aldıktan sonra 14 gün içinde ve kullanılmamış olması şartıyla iade edilebilir."
                    error={errors.cancellation?.message}
                    {...register('cancellation')}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-on-surface">
                        Sık Sorulan Sorular
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => faq.append({ question: '', answer: '' })}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add
                        </span>
                        Soru Ekle
                      </Button>
                    </div>

                    {faq.fields.length === 0 && (
                      <p className="rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                        Henüz soru eklenmedi.
                      </p>
                    )}

                    {faq.fields.map((f, i) => {
                      const fErr = errors.faq?.[i];
                      return (
                        <div
                          key={f.id}
                          className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-on-surface-variant">
                              Soru {i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => faq.remove(i)}
                              className="text-xs text-error hover:underline"
                            >
                              Sil
                            </button>
                          </div>
                          <TextField
                            placeholder="Soru"
                            error={fErr?.question?.message}
                            {...register(`faq.${i}.question`)}
                          />
                          <TextareaField
                            rows={2}
                            placeholder="Cevap"
                            error={fErr?.answer?.message}
                            {...register(`faq.${i}.answer`)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Konum Bilgileri
                  </h3>
                  <TextareaField
                    label="Adres"
                    rows={2}
                    placeholder="Atatürk Cd. No:45 Osmangazi / Bursa"
                    error={errors.location?.address?.message}
                    {...register('location.address')}
                  />
                  <TextField
                    label="İlçe / Semt"
                    placeholder="Osmangazi"
                    error={errors.location?.district?.message}
                    {...register('location.district')}
                  />
                  <TextField
                    label="Telefon"
                    placeholder="+90 224 123 45 67"
                    error={errors.location?.phone?.message}
                    {...register('location.phone')}
                  />
                  <TextField
                    label="Çalışma Saatleri"
                    placeholder="Pzt-Cmt 10:00-22:00"
                    error={errors.location?.workingHours?.message}
                    {...register('location.workingHours')}
                  />
                  <TextField
                    label="Harita URL"
                    hint="Google Maps paylaşım linki"
                    placeholder="https://maps.google.com/..."
                    error={errors.location?.mapUrl?.message}
                    {...register('location.mapUrl')}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-4">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Ödeme & Taksit
                  </h3>
                  <SelectField
                    label="Maksimum Taksit"
                    hint="Müşteri en fazla kaç taksitle ödeyebilir."
                    error={errors.paymentInfo?.maxInstallments?.message}
                    {...register('paymentInfo.maxInstallments')}
                  >
                    {[1, 2, 3, 6, 9, 12].map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? 'Tek Çekim' : `${n} Taksit`}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    label="Taksit Notu"
                    placeholder="Örn. 3 taksit komisyonsuz"
                    error={errors.paymentInfo?.installmentNote?.message}
                    {...register('paymentInfo.installmentNote')}
                  />

                  <div className="rounded-lg bg-primary-container/30 p-3 text-xs text-on-primary-container">
                    <b>Bilgi:</b> Gerçek taksit komisyonları ödeme sırasında
                    iyzico tarafından hesaplanır. Buradaki değer üst sınırdır.
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'media' && (
            <Card>
              <CardBody className="space-y-3">
                <h3 className="text-sm font-semibold text-on-surface">
                  Kampanya Görselleri
                </h3>
                <CampaignImageUploader value={images} onChange={setImages} />
                {images.length === 0 && (
                  <p className="text-xs text-error">
                    En az bir görsel eklemelisiniz.
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 'publish' && (
            <div className="max-w-xl">
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="text-sm font-semibold text-on-surface">
                    Yayın Ayarları
                  </h3>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/40"
                    />
                    <div>
                      <span className="text-sm font-medium text-on-surface">
                        Aktif
                      </span>
                      <p className="text-xs text-on-surface-variant">
                        Pasif kampanyalar sitede görünmez.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...register('isFeatured')}
                      className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/40"
                    />
                    <div>
                      <span className="text-sm font-medium text-on-surface">
                        Öne Çıkan
                      </span>
                      <p className="text-xs text-on-surface-variant">
                        Ana sayfa öne çıkanlar şeridinde gösterilir.
                      </p>
                    </div>
                  </label>

                  <TextField
                    type="date"
                    label="Son Kullanım"
                    required
                    error={errors.expiresAt?.message}
                    {...register('expiresAt')}
                  />
                </CardBody>
              </Card>
            </div>
          )}
        </div>

        {/* Sabit kaydet barı */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-outline-variant bg-surface/95 p-3 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <p className="hidden text-xs text-on-surface-variant md:block">
              {isEdit ? 'Değişiklikler kaydedildiğinde canlıya yansır.' : 'Yeni kampanya — kaydet ile yayına alınır.'}
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/admin/kampanyalar')}
                disabled={saving}
              >
                Vazgeç
              </Button>
              <Button type="submit" loading={saving}>
                {isEdit ? 'Değişiklikleri Kaydet' : 'Kampanyayı Oluştur'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CampaignFormPage;
export { CampaignFormPage as Component };
