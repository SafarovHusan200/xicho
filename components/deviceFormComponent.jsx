'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import {
  Info,
  Upload,
  FileText,
  X,
  Image as ImageIcon,
  MapPin,
  Save,
  XCircle,
  CheckCircle2,
  AlertCircle,
  CalendarIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

// ─── Zod schema ───────────────────────────────────────────────
const schema = z.object({
  qurilmaNomi: z.string().min(2, 'Qurilma nomini kiriting (kamida 2 belgi)'),
  royxatRaqami: z
    .string()
    .min(3, "Ro'yxat raqamini kiriting")
    .regex(/^[A-Za-z0-9\-]+$/, "Faqat harf, raqam va '-' belgisi"),
  zavodRaqami: z.string().min(2, 'Zavod raqamini kiriting'),
  ishgaTushirilganSana: z.string().min(1, 'Sanani kiriting'),
  sinovTuri: z.string().min(1, 'Sinov turini tanlang'),
  oxirgiSinov: z.string().min(1, 'Oxirgi sinov sanasini kiriting'),
  ishLabChiqaruvchi: z.string().min(1, 'Ishlab chiqaruvchini tanlang'),
  ornatilaganManzil: z.string().min(3, 'Manzilni kiriting'),
  masulShaxs: z.string().min(3, "Mas'ul shaxs F.I.O. ni kiriting"),
  qurilmaHolati: z.enum(['ishchi', 'tamirda'], {
    required_error: 'Qurilma holatini tanlang',
  }),
});

// ─── Error message component ───────────────────────────────────
function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────
function Field({ label, error, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </Label>
      {children}
      <ErrorMsg message={error} />
    </div>
  );
}

// ─── Dropzone sub-component ────────────────────────────────────
function DropZone({ accept, maxSize, label, hint, icon: Icon, files, onDrop, onRemove, error }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200 select-none
          ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
              : error
                ? 'border-red-300 bg-red-50 hover:border-red-400'
                : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors
          ${isDragActive ? 'bg-emerald-100' : 'bg-slate-100'}`}
        >
          <Icon className={`w-6 h-6 ${isDragActive ? 'text-emerald-600' : 'text-slate-400'}`} />
        </div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      </div>

      <ErrorMsg message={error} />

      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-xs bg-white border border-slate-100 rounded-lg px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate text-slate-700">{f.name}</span>
                <span className="text-slate-400 shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-2 text-slate-300 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Keyingi sinov auto-calculator ────────────────────────────
function useKeyingiSinov(oxirgiSinov, sinovTuri) {
  return React.useMemo(() => {
    if (!oxirgiSinov || !sinovTuri) return '';
    const d = new Date(oxirgiSinov);
    if (isNaN(d)) return '';
    const months = { 'texnik-korik': 12, 'texnik-shahodat': 24, 'bosim-sinovi': 6 };
    d.setMonth(d.getMonth() + (months[sinovTuri] ?? 12));
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [oxirgiSinov, sinovTuri]);
}

// ─── Main component ────────────────────────────────────────────
export default function DeviceFormComponent({ onSubmit: onSubmitProp, onCancel }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(null);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { qurilmaHolati: 'ishchi' },
  });

  const [imageFiles, setImageFiles] = React.useState([]);
  const [imageError, setImageError] = React.useState('');
  const [docFiles, setDocFiles] = React.useState([]);
  const [docError, setDocError] = React.useState('');

  const sinovTuri = watch('sinovTuri');
  const oxirgiSinov = watch('oxirgiSinov');
  const keyingiSinov = useKeyingiSinov(oxirgiSinov, sinovTuri);

  const handleImageDrop = (accepted, rejected) => {
    setImageError('');
    if (rejected.length) setImageError('Faqat PNG/JPG, maksimal 5MB ruxsat etiladi');
    setImageFiles((prev) => [...prev, ...accepted]);
  };
  const handleDocDrop = (accepted, rejected) => {
    setDocError('');
    if (rejected.length) setDocError('Faqat PDF, maksimal 20MB ruxsat etiladi');
    setDocFiles((prev) => [...prev, ...accepted]);
  };

  const onSubmit = async (data) => {
    if (!imageFiles.length) {
      setImageError('Kamida bitta rasm yuklang');
      return;
    }
    // if (!docFiles.length) {
    //   setDocError('Kamida bitta hujjat yuklang');
    //   return;
    // }
    await onSubmitProp?.({ ...data, imageFiles, docFiles });
  };

  const inputCls = (hasError) =>
    `h-10 rounded-lg border text-sm transition-colors
     ${
       hasError
         ? 'border-red-400 bg-red-50 focus-visible:ring-red-300'
         : 'border-slate-200 bg-white focus-visible:ring-emerald-300'
     }`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 max-w-full w-full mx-auto"
    >
      {/* ── Section 1: Ma'lumotlar ─────────────────────────── */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-600" />
            </span>
            Qurilma ma'lumotlari
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Qurilma nomi — full width */}
            <Field
              label="Qurilma nomi"
              error={errors.qurilmaNomi?.message}
              className="md:col-span-1"
            >
              <Input
                {...register('qurilmaNomi')}
                placeholder="Masalan: Gidravlik press P-50"
                className={inputCls(errors.qurilmaNomi)}
              />
            </Field>

            {/* Ishga tushirilgan sana */}
            <Field label="Ishga tushirilgan sana" error={errors.ishgaTushirilganSana?.message}>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="flex  justify-between font-normal text-[]"
                  >
                    {date ? date.toLocaleDateString() : 'mm/dd/yyyy'}
                    <CalendarIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date}
                    captionLayout="dropdown"
                    endMonth={new Date(new Date().getFullYear() + 10, 11, 31)}
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/* Ro'yxat raqami */}
            <Field label="Ro'yxat raqami" error={errors.royxatRaqami?.message}>
              <Input
                {...register('royxatRaqami')}
                placeholder="REG-2024-001"
                className={inputCls(errors.royxatRaqami)}
              />
            </Field>

            {/* Zavod raqami */}
            <Field label="Zavod raqami" error={errors.zavodRaqami?.message}>
              <Input
                {...register('zavodRaqami')}
                placeholder="SN-998122"
                className={inputCls(errors.zavodRaqami)}
              />
            </Field>

            {/* Sinov turi */}
            <Field label="Sinov turi" error={errors.sinovTuri?.message}>
              <Controller
                name="sinovTuri"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={inputCls(errors.sinovTuri)}>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texnik-korik">Texnik ko'rik</SelectItem>
                      <SelectItem value="texnik-shahodat">Texnik shahodat</SelectItem>
                      <SelectItem value="bosim-sinovi">Bosim sinovi</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Oxirgi sinov */}
            <Field label="Oxirgi sinov" error={errors.oxirgiSinov?.message}>
              <Input
                type="date"
                {...register('oxirgiSinov')}
                className={inputCls(errors.oxirgiSinov)}
              />
            </Field>

            {/* Ishlab chiqaruvchi */}
            <Field label="Ishlab chiqaruvchi" error={errors.ishLabChiqaruvchi?.message}>
              <Controller
                name="ishLabChiqaruvchi"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={inputCls(errors.ishLabChiqaruvchi)}>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uzb-zavod">O'zbekiston zavodi</SelectItem>
                      <SelectItem value="rus-zavod">Rossiya zavodi</SelectItem>
                      <SelectItem value="xitoy-zavod">Xitoy zavodi</SelectItem>
                      <SelectItem value="boshqa">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Keyingi sinov — auto */}
            <Field label="Keyingi sinov (avtomatik)">
              <div
                className={`h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center text-sm
                ${keyingiSinov ? 'text-slate-700' : 'text-slate-400 italic'}`}
              >
                {keyingiSinov || 'Sana tanlangach hisoblanadi...'}
              </div>
            </Field>

            {/* Manzil — full left */}
            <Field label="O'rnatilgan manzil" error={errors.ornatilaganManzil?.message}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...register('ornatilaganManzil')}
                  placeholder="Sex #3, B blok"
                  className={`pl-9 ${inputCls(errors.ornatilaganManzil)}`}
                />
              </div>
            </Field>

            {/* Qurilma holati */}
            <Field label="Qurilma holati" error={errors.qurilmaHolati?.message}>
              <Controller
                name="qurilmaHolati"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-3 mt-1"
                  >
                    {[
                      { value: 'ishchi', label: 'Ishchi holatda' },
                      { value: 'tamirda', label: "Ta'mirda" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all
                          ${
                            field.value === opt.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                      >
                        <RadioGroupItem value={opt.value} className="text-emerald-600" />
                        {opt.label}
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {/* Mas'ul shaxs — full width */}
            <Field
              label="Mas'ul shaxs"
              error={errors.masulShaxs?.message}
              className="md:col-span-2"
            >
              <Input
                {...register('masulShaxs')}
                placeholder="F.I.O."
                className={inputCls(errors.masulShaxs)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Fayllar ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              </span>
              Qurilma rasmi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <DropZone
              accept={{ 'image/png': [], 'image/jpeg': [] }}
              maxSize={5 * 1024 * 1024}
              label="Rasm yuklash uchun bosing yoki tortib keling"
              hint="PNG, JPG (Max. 5MB)"
              icon={Upload}
              files={imageFiles}
              onDrop={handleImageDrop}
              onRemove={(i) => setImageFiles((f) => f.filter((_, idx) => idx !== i))}
              error={imageError}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
              </span>
              Texnik hujjatlar
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <DropZone
              accept={{ 'application/pdf': [] }}
              maxSize={20 * 1024 * 1024}
              label="Hujjatlarni (PDF) yuklash"
              hint="Pasport, sertifikatlar (Max. 20MB)"
              icon={FileText}
              files={docFiles}
              onDrop={handleDocDrop}
              onRemove={(i) => setDocFiles((f) => f.filter((_, idx) => idx !== i))}
              error={docError}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Footer buttons ────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <XCircle className="w-4 h-4" />
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </form>
  );
}
