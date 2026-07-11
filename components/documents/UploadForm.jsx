'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import useGetQuery from '@/hooks/all/useGetQuery';
import useEmployeeStore from '@/store/useEmployeeStore';
import { staffio } from '@/services/staffio';
import { KEYS } from '@/constants/key';
import { URLS } from '@/constants/url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateFile } from './fileUtils';
import FileDropZone from './FileDropZone';

function UploadForm({ onSubmit, onClose, isPending, t, devices, testLogs, persons }) {
  const [ownerType, setOwnerType] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: session } = useSession();
  const { employees, setEmployees } = useEmployeeStore();
  const { data: employeesData } = useGetQuery({
    key: KEYS.employees,
    url: URLS.employee,
    params: { limit: 10000 },
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    apiClient: staffio,
    enabled: !!session?.accessToken && employees.length === 0,
    redirectOn403: false,
  });

  useEffect(() => {
    const data = employeesData?.data?.data;
    if (data?.length) setEmployees(data);
  }, [employeesData]);

  const getEmployeeName = (employeeId) => {
    const emp = employees?.find((e) => e.id === employeeId);
    if (!emp) return '—';
    return `${emp.last_name} ${emp.first_name}`;
  };

  const handleOwnerTypeChange = (val) => {
    setOwnerType(val);
    setOwnerId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!ownerType) errs.ownerType = t('ownerTypeError');
    if (!ownerId.trim()) errs.ownerId = t('ownerIdError');
    if (!file) errs.file = t('fileError');
    else {
      const fileError = validateFile(file, t);
      if (fileError) errs.file = fileError;
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const fd = new FormData();
    fd.append('owner_type', ownerType);
    fd.append('owner_id', ownerId.trim());
    fd.append('file', file);
    onSubmit(fd);
  };

  const ownerIdContent = () => {
    if (ownerType === 'device_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectDevice')} />
          </SelectTrigger>
          <SelectContent>
            {(devices ?? []).map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
                {d.serial_number ? ` · ${d.serial_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (ownerType === 'test_log_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectTestLog')} />
          </SelectTrigger>
          <SelectContent>
            {(testLogs ?? []).map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.test_type ?? '—'}
                {l.test_protocol_number ? ` · ${l.test_protocol_number}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (ownerType === 'responsible_person_id') {
      return (
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('selectPerson')} />
          </SelectTrigger>
          <SelectContent>
            {(persons ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.employee_id ? getEmployeeName(p.employee_id) : p.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        value={ownerId}
        onChange={(e) => setOwnerId(e.target.value)}
        placeholder="UUID"
        className="text-[14px]"
        disabled
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      {/* Owner type */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('ownerTypeLabel')} *</Label>
        <Select value={ownerType} onValueChange={handleOwnerTypeChange}>
          <SelectTrigger className="w-full text-[14px]">
            <SelectValue placeholder={t('ownerTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="device_id">{t('ownerTypeDevice')}</SelectItem>
            <SelectItem value="test_log_id">{t('ownerTypeTestLog')}</SelectItem>
            <SelectItem value="responsible_person_id">{t('ownerTypePerson')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.ownerType && <p className="text-xs text-destructive">{errors.ownerType}</p>}
      </div>

      {/* Owner ID */}
      {ownerType && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[14px] font-medium">{t('ownerIdLabel')} *</Label>
          {ownerIdContent()}
          {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId}</p>}
        </div>
      )}

      {/* File */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[14px] font-medium">{t('fileLabel')} *</Label>
        <FileDropZone file={file} onChange={setFile} t={t} />
        {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onClose} className="text-[13px]">
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="text-[13px] bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              {t('uploading')}
            </span>
          ) : (
            t('upload')
          )}
        </Button>
      </div>
    </form>
  );
}

export default UploadForm;
