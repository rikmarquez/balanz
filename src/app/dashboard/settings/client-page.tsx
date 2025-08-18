'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Calculator, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  User,
  Database,
  Palette
} from 'lucide-react'

interface Account {
  id: string
  name: string
  currentBalance: number
  type: string
}

interface CreditCard {
  id: string
  name: string
  currentBalance: number
  creditLimit: number
}

export function SettingsClient() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(false)
  const [recalculateLoading, setRecalculateLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    fetchData()
    // Establecer la fecha solo en el cliente para evitar hidratación
    setCurrentDate(new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }))
  }, [])

  const fetchData = async () => {
    try {
      const [accountsRes, cardsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/credit-cards')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json()
        setCreditCards(Array.isArray(cardsData) ? cardsData : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const recalculateBalances = async () => {
    setRecalculateLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/recalculate-balances', {
        method: 'POST'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Saldos recalculados exitosamente' })
        await fetchData() // Refresh data
      } else {
        setMessage({ type: 'error', text: 'Error al recalcular saldos' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setRecalculateLoading(false)
    }
  }

  const exportData = async () => {
    try {
      setLoading(true)
      
      // Simular exportación de datos (futuro: implementar descarga real)
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Funcionalidad de exportación próximamente disponible' })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar datos' })
      setLoading(false)
    }
  }

  const resetTransactions = async () => {
    // Confirmación múltiple para evitar resets accidentales
    const confirmation1 = confirm(
      '⚠️ ADVERTENCIA: Esto eliminará SOLO las transacciones y pagos de tarjetas, y restaurará los saldos iniciales.\n\nMANTIENE: Cuentas, tarjetas, categorías y tags\nELIMINA: Transacciones y pagos\n\n¿Continuar?'
    )
    
    if (!confirmation1) return
    
    const confirmation2 = prompt(
      'Para confirmar, escribe exactamente: RESET\n\n(Esta acción NO SE PUEDE DESHACER)'
    )
    
    if (confirmation2 !== 'RESET') {
      alert('Confirmación incorrecta. Reset cancelado.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET_TRANSACTIONS' }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ 
          type: 'success', 
          text: `Reset exitoso: ${result.data.deletedTransactions} transacciones eliminadas. ${result.data.resetAccounts} cuentas y ${result.data.resetCards} tarjetas restauradas a saldos iniciales.`
        })
        await fetchData() // Refrescar datos
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al realizar el reset' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const resetAllData = async () => {
    // Confirmación múltiple para evitar limpieza completa accidental
    const confirmation1 = confirm(
      '🚨 ADVERTENCIA EXTREMA: Esto eliminará TODOS los datos excepto usuarios.\n\nELIMINA TODO:\n- Todas las cuentas de efectivo\n- Todas las tarjetas de crédito\n- Todas las transacciones\n- Todas las categorías\n- Todos los tags\n- Todos los ajustes de balance\n\nMANTIENE:\n- Usuarios (para poder hacer login)\n\n¿Continuar con la limpieza COMPLETA?'
    )
    
    if (!confirmation1) return
    
    const confirmation2 = prompt(
      'Para confirmar la LIMPIEZA COMPLETA, escribe exactamente: ELIMINAR TODO\n\n(Esta acción NO SE PUEDE DESHACER y eliminará TODOS tus datos financieros)'
    )
    
    if (confirmation2 !== 'ELIMINAR TODO') {
      alert('Confirmación incorrecta. Limpieza cancelada.')
      return
    }

    const confirmation3 = confirm(
      'ÚLTIMA CONFIRMACIÓN:\n\n¿Estás 100% seguro de que quieres eliminar TODOS los datos?\n\nEsto significa empezar completamente desde cero.\n\nClick OK para ELIMINAR TODO o Cancel para abortar.'
    )
    
    if (!confirmation3) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/reset-all-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ 
          type: 'success', 
          text: 'Limpieza completa exitosa. Todos los datos eliminados excepto usuarios. Puedes empezar desde cero creando nuevas cuentas y tarjetas.'
        })
        await fetchData() // Refrescar datos (debería mostrar vacío)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al realizar la limpieza completa' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    if (message) clearMessage()
  }, [message])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* Sección: Gestión de Datos */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Datos</h2>
          </div>

          <div className="space-y-4">
            {/* Recalcular saldos */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Recalcular Saldos</h3>
                <p className="text-sm text-gray-600">
                  Recalcula automáticamente los saldos de todas las cuentas y tarjetas basándose en el historial de transacciones
                </p>
              </div>
              <Button
                onClick={recalculateBalances}
                disabled={recalculateLoading}
                className="flex items-center gap-2"
              >
                {recalculateLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                {recalculateLoading ? 'Recalculando...' : 'Recalcular'}
              </Button>
            </div>

            {/* Ajustes manuales */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Ajustes Manuales de Saldos</h3>
                <p className="text-sm text-gray-600">
                  Corrige saldos manualmente cuando sea necesario y mantén un historial de cambios
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/dashboard/admin/balance-adjustments'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Ajustar Saldos
              </Button>
            </div>

            {/* Exportar datos */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Exportar Datos</h3>
                <p className="text-sm text-gray-600">
                  Descarga una copia de seguridad de todos tus datos en formato JSON
                </p>
              </div>
              <Button
                onClick={exportData}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>

            {/* Importar datos (futuro) */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-60">
              <div>
                <h3 className="font-medium text-gray-900">Importar Datos</h3>
                <p className="text-sm text-gray-600">
                  Restaura tus datos desde un archivo de respaldo (próximamente)
                </p>
              </div>
              <Button
                disabled
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar
              </Button>
            </div>
          </div>
        </div>

        {/* Sección: Resumen de Cuentas */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Resumen de Cuentas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cuentas de efectivo */}
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Cuentas de Efectivo</h3>
              <div className="space-y-2">
                {(Array.isArray(accounts) ? accounts : []).map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{account.name}</span>
                    <span className={`font-semibold ${
                      account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${account.currentBalance.toLocaleString()}
                    </span>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No hay cuentas configuradas
                  </div>
                )}
              </div>
            </div>

            {/* Tarjetas de crédito */}
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Tarjetas de Crédito</h3>
              <div className="space-y-2">
                {(Array.isArray(creditCards) ? creditCards : []).map((card) => (
                  <div key={card.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{card.name}</span>
                      <span className="text-red-600 font-semibold">
                        ${Math.abs(card.currentBalance).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Límite: ${card.creditLimit.toLocaleString()} | 
                      Disponible: ${(card.creditLimit - Math.abs(card.currentBalance)).toLocaleString()}
                    </div>
                  </div>
                ))}
                {creditCards.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No hay tarjetas configuradas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Preferencias (futuro) */}
        <div className="bg-white rounded-lg border p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Preferencias de Usuario</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Tema Visual</h3>
                <p className="text-sm text-gray-600">
                  Cambiar entre modo claro y oscuro (próximamente)
                </p>
              </div>
              <Button disabled variant="outline">
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Formato de Moneda</h3>
                <p className="text-sm text-gray-600">
                  Configurar moneda y formato de números (próximamente)
                </p>
              </div>
              <Button disabled variant="outline">
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Notificaciones</h3>
                <p className="text-sm text-gray-600">
                  Configurar recordatorios y alertas (próximamente)
                </p>
              </div>
              <Button disabled variant="outline">
                Configurar
              </Button>
            </div>
          </div>
        </div>

        {/* Sección: Zona de Peligro */}
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Zona de Peligro</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Reset de Transacciones</h3>
                <p className="text-sm text-red-700">
                  Elimina SOLO las transacciones y pagos de tarjetas, y restaura los saldos iniciales. 
                  Mantiene cuentas, tarjetas, categorías y tags intactos.
                </p>
              </div>
              <Button
                onClick={resetTransactions}
                disabled={loading}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Transacciones
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-medium text-red-900">🚨 Eliminar Todos los Datos</h3>
                <p className="text-sm text-red-700">
                  Elimina TODOS los datos financieros (cuentas, tarjetas, transacciones, categorías, tags). 
                  Mantiene solo usuarios para poder hacer login. ¡Empezar desde cero!
                </p>
              </div>
              <Button
                onClick={resetAllData}
                disabled={loading}
                variant="outline"
                className="border-red-500 text-red-800 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Todo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información */}
      <div className="text-center text-gray-500 text-sm">
        <p>Balanz - Control de Gastos Personal v1.0</p>
        <p>Última actualización: {currentDate || 'Cargando...'}</p>
      </div>
    </div>
  )
}