'use client';

import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit, CreditCard as CreditCardIcon, Calendar, DollarSign, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { CreditCard } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { PaymentForm } from './PaymentForm';
import { useState } from 'react';

interface CreditCardDetailProps {
  creditCard: CreditCard;
  onUpdate?: () => void;
}

export function CreditCardDetail({ creditCard, onUpdate }: CreditCardDetailProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const availableCredit = parseFloat(creditCard.creditLimit) - parseFloat(creditCard.currentBalance);
  const utilizationPercentage = parseFloat(creditCard.creditLimit) > 0 
    ? (parseFloat(creditCard.currentBalance) / parseFloat(creditCard.creditLimit)) * 100 
    : 0;

  const getNextCutDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let nextCutDate = new Date(currentYear, currentMonth, creditCard.cutDay);
    
    // If the cut day has already passed this month, move to next month
    if (now.getDate() > creditCard.cutDay) {
      nextCutDate = new Date(currentYear, currentMonth + 1, creditCard.cutDay);
    }
    
    return nextCutDate;
  };

  const getNextDueDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let nextDueDate = new Date(currentYear, currentMonth, creditCard.dueDay);
    
    // If the due day has already passed this month, move to next month
    if (now.getDate() > creditCard.dueDay) {
      nextDueDate = new Date(currentYear, currentMonth + 1, creditCard.dueDay);
    }
    
    return nextDueDate;
  };

  const nextCutDate = getNextCutDate();
  const nextDueDate = getNextDueDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/credit-cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
              <span className="truncate">{creditCard.name}</span>
              {!creditCard.isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  Inactiva
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Detalles y estadísticas de tu tarjeta de crédito
            </p>
          </div>
        </div>
        
        {/* Action buttons in their own line for mobile */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            variant={showPaymentForm ? "outline" : "default"}
            disabled={parseFloat(creditCard.currentBalance) <= 0}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showPaymentForm ? 'Cancelar Pago' : 'Realizar Pago'}
          </Button>
          <Link href={`/dashboard/credit-cards/${creditCard.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <PaymentForm
          creditCard={creditCard}
          onPaymentSuccess={() => {
            setShowPaymentForm(false);
            onUpdate?.();
          }}
          onCancel={() => setShowPaymentForm(false)}
        />
      )}

      {/* Card Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Límite de Crédito</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(parseFloat(creditCard.creditLimit))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Crédito Disponible</h3>
              <p className={`text-2xl font-bold ${
                availableCredit < parseFloat(creditCard.creditLimit) * 0.1 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {formatCurrency(availableCredit)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <CreditCardIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Saldo Utilizado</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(parseFloat(creditCard.currentBalance))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Utilización</h3>
              <p className={`text-2xl font-bold ${
                utilizationPercentage > 80 ? 'text-red-600' :
                utilizationPercentage > 60 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {utilizationPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Utilización del Crédito</h3>
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                utilizationPercentage > 80 ? 'bg-red-500' :
                utilizationPercentage > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0</span>
            <span>{formatCurrency(parseFloat(creditCard.creditLimit))}</span>
          </div>
          <div className="text-sm text-gray-600">
            {utilizationPercentage <= 30 && (
              <p className="text-green-600">✅ Excelente utilización del crédito</p>
            )}
            {utilizationPercentage > 30 && utilizationPercentage <= 60 && (
              <p className="text-yellow-600">⚠️ Utilización moderada del crédito</p>
            )}
            {utilizationPercentage > 60 && utilizationPercentage <= 80 && (
              <p className="text-orange-600">⚡ Utilización alta del crédito</p>
            )}
            {utilizationPercentage > 80 && (
              <p className="text-red-600">🚨 Utilización muy alta del crédito</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Calendario de Pagos</span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Próximo Corte</h4>
                <p className="text-sm text-blue-700">Día {creditCard.cutDay} de cada mes</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">
                  {nextCutDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </p>
                <p className="text-sm text-blue-700">
                  {Math.ceil((nextCutDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-900">Próximo Vencimiento</h4>
                <p className="text-sm text-red-700">Día {creditCard.dueDay} de cada mes</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-900">
                  {nextDueDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </p>
                <p className="text-sm text-red-700">
                  {Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Tarjeta</h3>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-700">Fecha de creación</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {new Date(creditCard.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Última actualización</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {new Date(creditCard.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Estado</dt>
            <dd className="text-sm text-gray-900 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                creditCard.isActive 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {creditCard.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}