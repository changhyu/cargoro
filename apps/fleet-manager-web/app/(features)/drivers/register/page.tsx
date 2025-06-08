'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { useToast } from '@/hooks/use-toast';

import { driverService } from '../../../services/api';

export default function RegisterDriverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    vehicleType: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prevData => ({ ...prevData, vehicleType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 드라이버 생성에 필요한 모든 필수 필드 포함
      await driverService.createDriver({
        name: formData.name,
        licenseNumber: formData.licenseNumber,
        email: '', // 필수 필드이나 현재 폼에 없음
        phone: '', // 필수 필드이나 현재 폼에 없음
        licenseExpiry: new Date().toISOString(), // 임시값
        isActive: true,
      });
      toast({ title: 'Success', description: 'Driver registered successfully.' });
      router.push('/drivers');
    } catch (_error) {
      toast({ title: 'Error', description: 'Failed to register driver.' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="licenseNumber">License Number</Label>
        <Input
          id="licenseNumber"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label htmlFor="vehicleType">Vehicle Type</Label>
        <Select onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue>{formData.vehicleType || 'Select vehicle type'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="motorcycle">Motorcycle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Register Driver</Button>
    </form>
  );
}
