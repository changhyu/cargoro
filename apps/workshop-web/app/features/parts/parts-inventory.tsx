'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@cargoro/ui';
import { useToast } from '@cargoro/ui';

// 부품 타입 정의
export interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  location?: string;
  description?: string;
  lastRestocked?: string;
  imageUrl?: string;
}

export interface PartsInventoryProps {
  parts: Part[];
  onPartSelect?: (part: Part) => void;
  onAddPart?: () => void;
  onUpdateStock?: (partId: string, newStock: number) => void;
  onReorder?: (partId: string) => void;
}

/**
 * 부품 재고 관리 컴포넌트
 *
 * 정비소의 부품 재고를 표시하고 관리합니다.
 */
export function PartsInventory({
  parts = [],
  onPartSelect,
  onAddPart,
  onUpdateStock,
  onReorder,
}: PartsInventoryProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // 부품 카테고리 목록 추출
  const categories = Array.from(new Set(parts.map(part => part.category)));

  // 검색 및 필터 적용
  const filteredParts = parts.filter(part => {
    // 검색어 필터링 (부품명, 부품번호, 브랜드 기준)
    const matchesSearch =
      searchQuery === '' ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase());

    // 카테고리 필터링
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

    // 재고 부족 필터링
    const matchesLowStock = !showLowStock || part.stock <= part.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // 부품 선택 핸들러
  const handlePartSelect = (part: Part) => {
    if (onPartSelect) {
      onPartSelect(part);
      toast({
        title: t('parts.selected'),
        description: `${part.name} (${part.partNumber})`,
      });
    }
  };

  // 부품 추가 핸들러
  const handleAddPart = () => {
    if (onAddPart) {
      onAddPart();
    }
  };

  // 재고 업데이트 핸들러
  const handleUpdateStock = (partId: string, newStock: number) => {
    if (onUpdateStock) {
      onUpdateStock(partId, newStock);
      toast({
        title: t('parts.stockUpdated'),
        description: t('parts.newStockLevel', { stock: newStock }),
      });
    }
  };

  // 재주문 핸들러
  const handleReorder = (partId: string) => {
    if (onReorder) {
      onReorder(partId);
      toast({
        title: t('parts.reorderInitiated'),
        description: t('parts.reorderDescription'),
      });
    }
  };

  return (
    <div className="parts-inventory">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('parts.inventory')}</h2>
        <Button onClick={handleAddPart}>{t('parts.addNew')}</Button>
      </div>

      <div className="filters mb-6">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder={t('parts.search')}
            className="flex-grow rounded-md border px-3 py-2"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <select
            className="rounded-md border px-3 py-2"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t('parts.allCategories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex items-center">
          <input
            type="checkbox"
            id="low-stock-filter"
            className="mr-2"
            checked={showLowStock}
            onChange={e => setShowLowStock(e.target.checked)}
          />
          <label htmlFor="low-stock-filter">{t('parts.showLowStock')}</label>
        </div>
      </div>

      {filteredParts.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery || categoryFilter !== 'all' || showLowStock
            ? t('parts.noResults')
            : t('parts.noParts')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParts.map(part => (
            <div
              key={part.id}
              className="part-card cursor-pointer rounded-lg border p-4 hover:bg-accent"
              onClick={() => handlePartSelect(part)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{part.name}</h3>
                  <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium
                    ${part.stock > part.minStock ? 'bg-green-100 text-green-800' : ''}
                    ${part.stock <= part.minStock && part.stock > 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${part.stock === 0 ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {part.stock > part.minStock
                    ? t('parts.inStock')
                    : part.stock === 0
                      ? t('parts.outOfStock')
                      : t('parts.lowStock')}
                </div>
              </div>

              <div className="mt-2">
                <p>
                  {t('parts.brand')}: {part.brand}
                </p>
                <p>
                  {t('parts.category')}: {part.category}
                </p>
                <p>
                  {t('parts.price')}: ₩{part.price.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-medium">
                    {t('parts.stock')}: {part.stock} / {t('parts.minStock')}: {part.minStock}
                  </p>
                  {part.stock <= part.minStock && (
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        handleReorder(part.id);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {t('parts.reorder')}
                    </Button>
                  )}
                </div>
              </div>

              <div className="stock-controls mt-3 flex items-center justify-between">
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    if (part.stock > 0) {
                      handleUpdateStock(part.id, part.stock - 1);
                    }
                  }}
                  size="sm"
                  variant="outline"
                  disabled={part.stock === 0}
                >
                  -
                </Button>
                <span className="mx-2">{part.stock}</span>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    handleUpdateStock(part.id, part.stock + 1);
                  }}
                  size="sm"
                  variant="outline"
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
