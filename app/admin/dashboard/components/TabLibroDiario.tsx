"use client"

import { useState, useMemo, useEffect } from "react"
import { BookOpen, Search, CalendarDays, ArrowDownUp, Filter, TrendingUp, CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabLibroDiario({ ventas = [], egresos = [] }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState("todos")
  
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' })

  // Tasa para normalizar a Pesos el display (la misma de tu punto de venta)
  const [tasaDolarBlue, setTasaDolarBlue] = useState<number>(1510)

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares/blue")
        const data = await response.json()
        if (data && data.venta) setTasaDolarBlue(data.venta)
      } catch (error) {} 
    }
    fetchDolar()
  }, [])

  // 1. Unificamos Ventas y Egresos en un solo "Libro"
  const movimientosUnificados = useMemo(() => {
    const vnts = ventas.map((v: any) => ({
      id: v.id,
      tipo: "ingreso",
      fecha: new Date(v.created_at),
      created_at: v.created_at,
      concepto: v.nombre_producto,
      cliente: v.cliente_referencia || "Mostrador",
      metodo: v.metodo_pago || "Efectivo",
      montoUSD: Number(v.monto_pagado || 0),
      estado: v.estado
    }))

    const egrs = egresos.map((e: any) => ({
      id: e.id,
      tipo: "egreso",
      fecha: new Date(e.created_at),
      created_at: e.created_at,
      concepto: e.motivo,
      cliente: "N/A",
      metodo: "Efectivo", // Por lo general los egresos de caja son billetes
      montoUSD: Number(e.monto || 0),
      estado: "Completada"
    }))

    return [...vnts, ...egrs]
  }, [ventas, egresos])

  // 2. Filtramos el Libro
  const movimientosFiltrados = useMemo(() => {
    return movimientosUnificados.filter((mov) => {
      const matchSearch = mov.concepto.toLowerCase().includes(searchTerm.toLowerCase()) || mov.cliente.toLowerCase().includes(searchTerm.toLowerCase())
      const matchMetodo = metodoPagoFiltro === "todos" || mov.metodo === metodoPagoFiltro
      
      let matchFecha = true
      if (fechaDesde) matchFecha = matchFecha && new Date(mov.created_at) >= new Date(fechaDesde + 'T00:00:00')
      if (fechaHasta) matchFecha = matchFecha && new Date(mov.created_at) <= new Date(fechaHasta + 'T23:59:59')

      return matchSearch && matchMetodo && matchFecha
    })
  }, [movimientosUnificados, searchTerm, metodoPagoFiltro, fechaDesde, fechaHasta])

  // 3. Ordenamos la Tabla
  const movimientosOrdenados = useMemo(() => {
    let sortableItems = [...movimientosFiltrados]
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [movimientosFiltrados, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  // 4. Métricas Superiores
  const totalIngresosARS = movimientosFiltrados.filter(m => m.tipo === "ingreso").reduce((sum, m) => sum + (m.montoUSD * tasaDolarBlue), 0)
  const totalEgresosARS = movimientosFiltrados.filter(m => m.tipo === "egreso").reduce((sum, m) => sum + (m.montoUSD * tasaDolarBlue), 0)
  
  // Desglose por Método
  const metodosAgrupados = movimientosFiltrados.filter(m => m.tipo === "ingreso").reduce((acc: any, m) => {
    acc[m.metodo] = (acc[m.metodo] || 0) + (m.montoUSD * tasaDolarBlue)
    return acc
  }, {})

  const formatARS = (val: number) => `$ ${val.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2"><BookOpen className="size-6 text-emerald-500"/> Libro Diario</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Caja y movimientos detallados (Ref: 1 USD = ${tasaDolarBlue})</p>
        </div>
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><ArrowUpCircle className="size-3.5"/> Total Ingresos ARS</span>
          <p className="text-2xl font-black text-white mt-1">{formatARS(totalIngresosARS)}</p>
        </div>
        <div className="bg-[#161B22] border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5"><ArrowDownCircle className="size-3.5"/> Total Egresos ARS</span>
          <p className="text-2xl font-black text-white mt-1">{formatARS(totalEgresosARS)}</p>
        </div>
        <div className="lg:col-span-2 bg-[#161B22] border border-zinc-800 p-5 rounded-2xl flex items-center overflow-x-auto hide-scrollbar gap-6">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest shrink-0 border-r border-zinc-800 pr-6"><Wallet className="size-4 mb-1"/> Arqueo<br/>por Medio</span>
          <div className="flex gap-6 shrink-0">
            {Object.entries(metodosAgrupados).map(([metodo, total]: any) => (
              <div key={metodo}>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">{metodo}</span>
                <p className="text-sm font-black text-zinc-200">{formatARS(total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-end">
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input type="text" placeholder="Buscar concepto o cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-64 rounded-xl bg-zinc-950 border border-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-emerald-500" />
          </div>
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl px-3 items-center gap-2">
            <Filter className="size-3.5 text-zinc-500"/>
            <select value={metodoPagoFiltro} onChange={e => setMetodoPagoFiltro(e.target.value)} className="bg-transparent text-xs text-white outline-none py-2.5 font-bold cursor-pointer">
              <option value="todos">Todos los Métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Getnet">Getnet</option>
              <option value="USD">USD (Físico)</option>
              <option value="USDT">Crypto (USDT)</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 w-full md:w-auto overflow-hidden">
          <CalendarDays className="size-4 text-zinc-500 shrink-0"/>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none w-full [color-scheme:dark]" title="Fecha Desde" />
          <span className="text-zinc-600 font-bold">-</span>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none w-full [color-scheme:dark]" title="Fecha Hasta" />
        </div>
      </div>

      {/* TABLA ESTILO EXCEL */}
      <div className="bg-[#161B22] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="p-4 pl-6 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('created_at')}>
                  <div className="flex items-center gap-1.5">Fecha & Hora <ArrowDownUp className="size-3 opacity-0 group-hover:opacity-100"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('concepto')}>
                  <div className="flex items-center gap-1.5">Concepto / Artículo <ArrowDownUp className="size-3 opacity-0 group-hover:opacity-100"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('cliente')}>
                  <div className="flex items-center gap-1.5">Cliente <ArrowDownUp className="size-3 opacity-0 group-hover:opacity-100"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('metodo')}>
                  <div className="flex items-center gap-1.5">Medio de Pago <ArrowDownUp className="size-3 opacity-0 group-hover:opacity-100"/></div>
                </th>
                <th className="p-4 text-right cursor-pointer hover:text-white transition-colors group" onClick={() => requestSort('montoUSD')}>
                  <div className="flex items-center justify-end gap-1.5">Monto Final ARS <ArrowDownUp className="size-3 opacity-0 group-hover:opacity-100"/></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {movimientosOrdenados.map((mov: any) => {
                const isIngreso = mov.tipo === "ingreso"
                const esAbono = mov.estado === "Abono"
                return (
                  <tr key={mov.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-zinc-300 block text-xs">{mov.fecha.toLocaleDateString("es-AR")}</span>
                      <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">{mov.fecha.toLocaleTimeString("es-AR", {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isIngreso ? <ArrowUpCircle className="size-4 text-emerald-500/70" /> : <ArrowDownCircle className="size-4 text-red-500/70" />}
                        <span className={cn("font-bold text-sm", isIngreso ? "text-zinc-200" : "text-red-400")}>{mov.concepto}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1 ml-6 uppercase">Op: {mov.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", esAbono ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 bg-zinc-900")}>
                        {mov.cliente}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                        <CreditCard className="size-3.5 text-zinc-500"/> {mov.metodo}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={cn("font-black text-sm block", isIngreso ? "text-emerald-400" : "text-red-400")}>
                        {isIngreso ? "+" : "-"} {formatARS(mov.montoUSD * tasaDolarBlue)}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-600 block mt-0.5">USD {mov.montoUSD.toFixed(2)}</span>
                    </td>
                  </tr>
                )
              })}
              {movimientosOrdenados.length === 0 && (
                <tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold italic">No hay registros para este filtro o rango de fechas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}