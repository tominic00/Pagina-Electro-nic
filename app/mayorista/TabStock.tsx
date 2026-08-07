import { useState, useEffect, useRef } from "react"
import { Plus, X, DollarSign, Smartphone, Loader2, Edit3, Trash2, Download, Upload, Search, Filter, FileSpreadsheet, CheckSquare, Package, BatteryMedium, Tag, Copy, MessageCircle, Truck, Wrench, CheckCircle2 } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"
import * as XLSX from 'xlsx';

// LISTAS DESPLEGABLES OFICIALES
const MODELOS_APPLE = ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e", "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max" ]
const COLORES = ["Midnight", "Starlight", "Blue", "Black", "White", "(PRODUCT)RED", "Purple", "Deep Purple", "Pink", "Yellow", "Green", "Graphite", "Gold", "Silver", "Space Gray", "Natural Titanium", "Blue Titanium"]
const CAPACIDADES = ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "N/A"]
const CONDICIONES = ["Nuevo Sellado", "A+", "A", "A-", "B", "C", "Para reparar"]

export function TabStock({ usuarioActual }: { usuarioActual: any }) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [costoEnvioPromedio, setCostoEnvioPromedio] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  
  // 🚀 SUB-PESTAÑAS AMPLIADAS CON REPARACIÓN
  const [activeSubTab, setActiveSubTab] = useState<"disponibles" | "reparacion" | "vendidos">("disponibles")

  // Modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  // 🛠️ MODAL DE FINALIZACIÓN DE REPARACIÓN
  const [showRepararModal, setShowRepararModal] = useState(false)
  const [equipoEnReparacion, setEquipoEnReparacion] = useState<any>(null)
  const [costoReparacionUsd, setCostoReparacionUsd] = useState<number | "">("")
  const [nuevaCondicionPosReparacion, setNuevaCondicionPosReparacion] = useState("A")
  const [nuevoPrecioMayorista, setNuevoPrecioMayorista] = useState<number | "">("")
  const [nuevoPrecioMinorista, setNuevoPrecioMinorista] = useState<number | "">("")

  // Modales de Cotización
  const [showCotizarModal, setShowCotizarModal] = useState(false)
  const [showPrevisualizarModal, setShowPrevisualizarModal] = useState(false)
  const [cotizarItem, setCotizarItem] = useState<any>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // FORMULARIO ESTRUCTURADO
  const [formUI, setFormUI] = useState({
    tipo: "iPhone", modelo: "iPhone 13", capacidad: "128 GB", color: "Midnight", 
    bateria: "", condicion: "A", imei: "", costo_usd: "", precio_venta_usd: "", precio_minorista_usd: "",
    estado: "Disponible", stock_inicial: 1, comentarios: ""
  })

  // Formulario Cotización
  const [formCotizacion, setFormCotizacion] = useState({
    precio: "", moneda: "USD", actualizarPrecio: false, condicion: "A+", 
    disponibilidad: "Disponible", garantia: "30 días", observacion: "", incluirImei: true
  })

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCondicion, setFiltroCondicion] = useState("Todos")
  const [filtroBateriaMinima, setFiltroBateriaMinima] = useState("")
  const [filtroPrecioMaximo, setFiltroPrecioMaximo] = useState("")

  // 🚀 OPCIONES CONFIGURABLES DE EXPORTACIÓN
  const [exportOptions, setExportOptions] = useState({
    bateria: true,
    imei: true,
    costo: true,
    precioMayorista: true,
    precioMinorista: true,
    estado: true,
    comentarios: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: stockData } = await supabase.from("stock_mayorista").select("*").order("created_at", { ascending: false })
    
    const { data: pedidosData } = await supabase.from("pedidos_mayorista").select("*")
    if (pedidosData && pedidosData.length > 0) {
      let totalGastadoEnFletes = 0
      let totalEquiposTraidos = 0
      pedidosData.forEach(p => {
        totalGastadoEnFletes += Number(p.costo_envio_usd || 0)
        totalEquiposTraidos += Number(p.cantidad_equipos || 1)
      })
      if (totalEquiposTraidos > 0) {
        setCostoEnvioPromedio(totalGastadoEnFletes / totalEquiposTraidos)
      }
    }

    if (stockData) setEquipos(stockData)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 🚀 FILTRADO POR SUB-PESTAÑAS
  const equiposFiltrados = equipos.filter(eq => {
    if (activeSubTab === "disponibles" && (eq.estado === "Vendido" || eq.estado === "En Reparación")) return false
    if (activeSubTab === "reparacion" && eq.estado !== "En Reparación") return false
    if (activeSubTab === "vendidos" && eq.estado !== "Vendido") return false

    const matchTexto = eq.equipo.toLowerCase().includes(filtroTexto.toLowerCase()) || (eq.imei && eq.imei.toLowerCase().includes(filtroTexto.toLowerCase()))
    const matchCondicion = filtroCondicion === "Todos" ? true : eq.condicion === filtroCondicion
    
    let matchBateria = true
    if (filtroBateriaMinima !== "") {
      const minBat = Number(filtroBateriaMinima)
      if (!eq.bateria || Number(eq.bateria) < minBat) matchBateria = false
    }
    
    let matchPrecio = true
    if (filtroPrecioMaximo !== "") {
      const maxPrecio = Number(filtroPrecioMaximo)
      if (Number(eq.precio_venta_usd) > maxPrecio && Number(eq.precio_minorista_usd) > maxPrecio) matchPrecio = false
    }
    
    return matchTexto && matchCondicion && matchBateria && matchPrecio
  })

  // 🛠️ ABRIR MODAL DE FINALIZACIÓN DE REPARACIÓN
  const abrirFinalizarReparacion = (eq: any) => {
    setEquipoEnReparacion(eq)
    setCostoReparacionUsd("")
    setNuevaCondicionPosReparacion("A")
    setNuevoPrecioMayorista(eq.precio_venta_usd || "")
    setNuevoPrecioMinorista(eq.precio_minorista_usd || "")
    setShowRepararModal(true)
  }

  // 🚀 CONFIRMAR REPARACIÓN, SUMAR COSTO Y PASAR A DISPONIBLE
  const handleConfirmarReparacionFinalizada = async () => {
    if (!equipoEnReparacion) return
    setIsSaving(true)
    try {
      const costoArreglo = Number(costoReparacionUsd) || 0
      const costoAnterior = Number(equipoEnReparacion.costo_usd) || 0
      const costoTotalActualizado = costoAnterior + costoArreglo

      const { error } = await supabase.from("stock_mayorista").update({
        costo_usd: costoTotalActualizado,
        condicion: nuevaCondicionPosReparacion,
        precio_venta_usd: Number(nuevoPrecioMayorista) || 0,
        precio_minorista_usd: Number(nuevoPrecioMinorista) || 0,
        estado: 'Disponible',
        observaciones: `${equipoEnReparacion.observaciones || ''} | Reparación finalizada. Costo arreglo: USD ${costoArreglo}`.trim()
      }).eq("id", equipoEnReparacion.id)

      if (error) throw error

      alert("✅ Equipo reparado con éxito. Se sumó el costo de reparación y pasó a estar 'Disponible' en el inventario.")
      setShowRepararModal(false)
      fetchData()
    } catch (error: any) {
      alert("Error al actualizar equipo: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 📥 DESCARGA DIRECTA DE PLANTILLA CSV DE DEMOSTRACIÓN
  const descargarPlantillaCSV = () => {
    const headers = "Tipo,Modelo,Capacidad,Color,Bateria,Condicion,IMEI,Costo_Base_USD,Precio_Mayorista_USD,Precio_Minorista_USD,Estado,Comentarios"
    const fila1 = "iPhone,iPhone 13,128 GB,Midnight,87,A,359412345678901,400,480,550,Disponible,Excelente estado"
    const fila2 = "iPhone,iPhone 15 Pro,256 GB,Natural Titanium,100,Nuevo Sellado,359412345678902,850,980,1050,Disponible,Caja sellada"

    const contenidoCSV = `${headers}\n${fila1}\n${fila2}`
    
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "Plantilla_Ejemplo_ElectroNic.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 🚀 EXPORTAR LISTA DE STOCK CON FORMATO DE SEGUNDA CAPTURA Y CONFIGURACIÓN DINÁMICA
  const ejecutarExportacion = () => {
    const datosParaExportar = equiposFiltrados.map(eq => {
      const partes = eq.equipo.split(" - ")
      const modelo = partes[0] || eq.equipo
      const capacidad = partes[1] || ""
      const color = partes[2] || ""

      // Construcción del objeto fila respetando las columnas seleccionadas
      const fila: any = {
        "Tipo": "iPhone",
        "Modelo": modelo,
        "Capacidad": capacidad,
        "Color": color
      }

      if (exportOptions.bateria) fila["Bateria"] = eq.bateria || ""
      fila["Condicion"] = eq.condicion || "A"
      if (exportOptions.imei) fila["IMEI"] = eq.imei || ""
      if (exportOptions.costo) fila["Costo_Base_USD"] = eq.costo_usd || 0
      if (exportOptions.precioMayorista) fila["Precio_Mayorista_USD"] = eq.precio_venta_usd || 0
      if (exportOptions.precioMinorista) fila["Precio_Minorista_USD"] = eq.precio_minorista_usd || 0
      if (exportOptions.estado) fila["Estado"] = eq.estado || "Disponible"
      if (exportOptions.comentarios) fila["Comentarios"] = eq.observaciones || ""

      return fila
    })

    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja 1")

    const nombreArchivo = `Lista_Precios_${activeSubTab}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
    setShowExportModal(false)
  }

  // 📤 IMPORTACIÓN UNIVERSAL (.CSV, .XLSX, .NUMBERS)
  const handleImportarCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          throw new Error("El archivo está vacío o no se pudieron leer las filas.");
        }

        const getVal = (row: any, ...keys: string[]) => {
          const rowKeys = Object.keys(row);
          for (const key of keys) {
            const foundKey = rowKeys.find(k => k.trim().toLowerCase().replace(/_/g, '') === key.toLowerCase().replace(/_/g, ''));
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") {
              return String(row[foundKey]).trim();
            }
          }
          return "";
        };

        const parseMonto = (val: string) => {
          if (!val) return 0;
          const numLimpio = val.replace(/[^0-9.-]/g, '');
          return parseFloat(numLimpio) || 0;
        };

        const payload = jsonData.map(row => {
          const modelo = getVal(row, "Modelo", "Equipo", "Modelo/Equipo");
          const capacidad = getVal(row, "Capacidad", "GB", "Memoria");
          const color = getVal(row, "Color");
          const bateria = getVal(row, "Bateria", "Batería", "% Bateria");
          const condicion = getVal(row, "Condicion", "Condición", "Estado Fisico") || "A";
          const imei = getVal(row, "IMEI", "Serie", "N° Serie");
          const costo_usd = parseMonto(getVal(row, "Costo_Base_USD", "Costo", "Costo_USD", "Costo Base"));
          const precio_venta_usd = parseMonto(getVal(row, "Precio_Mayorista_USD", "Precio Mayorista", "Mayorista"));
          const precio_minorista_usd = parseMonto(getVal(row, "Precio_Minorista_USD", "Precio Minorista", "Minorista"));
          const estado = getVal(row, "Estado") || "Disponible";
          const observaciones = getVal(row, "Comentarios", "Observaciones", "Notas");

          let nombreEquipo = modelo;
          if (capacidad && capacidad !== "N/A" && !modelo.toLowerCase().includes(capacidad.toLowerCase())) {
            nombreEquipo += ` - ${capacidad}`;
          }
          if (color && color !== "N/A" && !modelo.toLowerCase().includes(color.toLowerCase())) {
            nombreEquipo += ` - ${color}`;
          }

          return {
            equipo: nombreEquipo,
            condicion: condicion,
            bateria: bateria || null,
            imei: imei || null,
            costo_usd: costo_usd,
            precio_venta_usd: precio_venta_usd,
            precio_minorista_usd: precio_minorista_usd,
            estado: estado,
            observaciones: observaciones,
            ingresado_por: usuarioActual.nombre
          };
        }).filter(p => p.equipo !== "");

        if (payload.length === 0) {
          throw new Error("No se encontraron filas válidas para importar.");
        }

        const { error } = await supabase.from("stock_mayorista").insert(payload);
        if (error) throw error;

        alert(`✅ ¡Se importaron ${payload.length} equipos con éxito!`);
        setShowImportModal(false);
        fetchData();

      } catch (error: any) {
        console.error("Error importación:", error);
        alert(`❌ Error al procesar el archivo: ${error.message || "Verificá que el archivo tenga datos válidos."}`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const abrirNuevo = () => {
    setEditingId(null)
    setFormUI({ tipo: "iPhone", modelo: "iPhone 13", capacidad: "128 GB", color: "Midnight", bateria: "", condicion: "A", imei: "", costo_usd: "", precio_venta_usd: "", precio_minorista_usd: "", estado: "Disponible", stock_inicial: 1, comentarios: "" })
    setShowAddModal(true)
  }

  const abrirEdicion = (eq: any) => {
    setEditingId(eq.id)
    
    const partes = eq.equipo.split(" - ")
    const mod = partes[0] || eq.equipo
    const cap = partes[1] || "N/A"
    const col = partes[2] || "N/A"

    setFormUI({ 
      tipo: "iPhone", 
      modelo: mod,
      capacidad: cap, 
      color: col, 
      bateria: eq.bateria || "", 
      condicion: eq.condicion || "A", 
      imei: eq.imei || "", 
      costo_usd: eq.costo_usd, 
      precio_venta_usd: eq.precio_venta_usd, 
      precio_minorista_usd: eq.precio_minorista_usd || "",
      estado: eq.estado || "Disponible", 
      stock_inicial: 1, 
      comentarios: eq.observaciones || "" 
    })
    setShowAddModal(true)
  }

  const eliminarEquipo = async (id: string) => {
    if (!confirm("⚠️ ¿Seguro que querés eliminar este equipo del stock definitivamente?\n\nSi el equipo fue vendido o reservado, también se desvinculará de esos registros.")) return

    try {
      setLoading(true)

      // 1. Limpiar referencias previas para evitar bloqueos por Foreign Key
      await supabase.from("ventas_mayorista").update({ equipo_id: null }).eq("equipo_id", id)
      await supabase.from("reservas_mayorista").delete().eq("equipo_id", id)
      await supabase.from("garantias_mayorista").delete().eq("equipo_id", id)

      // 2. Borrar el equipo de la tabla principal de stock
      const { error } = await supabase.from("stock_mayorista").delete().eq("id", id)

      if (error) throw error

      alert("✅ Equipo eliminado del inventario correctamente.")
      fetchData()
    } catch (error: any) {
      alert("❌ Error al borrar el equipo: " + error.message)
      setLoading(false)
    }
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const nombreGenerado = `${formUI.modelo} - ${formUI.capacidad} - ${formUI.color}`.replace(" - N/A", "")

      const payloadArray = []
      for(let i=0; i<formUI.stock_inicial; i++) {
        payloadArray.push({
          equipo: nombreGenerado,
          condicion: formUI.condicion,
          imei: formUI.stock_inicial === 1 ? formUI.imei : "",
          bateria: formUI.bateria,
          costo_usd: Number(formUI.costo_usd),
          precio_venta_usd: Number(formUI.precio_venta_usd),
          precio_minorista_usd: Number(formUI.precio_minorista_usd),
          estado: formUI.estado,
          observaciones: formUI.comentarios,
          ingresado_por: usuarioActual.nombre
        })
      }

      if (editingId) {
        await supabase.from("stock_mayorista").update(payloadArray[0]).eq("id", editingId)
      } else {
        await supabase.from("stock_mayorista").insert(payloadArray)
      }
      
      setShowAddModal(false)
      fetchData()
    } catch (error) {
      alert("Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  // COTIZACIÓN WHATSAPP
  const abrirCotizacion = (eq: any) => {
    setCotizarItem(eq)
    setFormCotizacion({
      precio: eq.precio_minorista_usd || eq.precio_venta_usd,
      moneda: "USD", actualizarPrecio: false,
      condicion: eq.condicion || "A+", disponibilidad: "Disponible",
      garantia: "30 días", observacion: "", incluirImei: true
    })
    setShowCotizarModal(true)
  }

  const avanzarAPrevisualizacion = async () => {
    if (formCotizacion.actualizarPrecio && Number(formCotizacion.precio) !== cotizarItem.precio_minorista_usd) {
      await supabase.from("stock_mayorista").update({ precio_minorista_usd: Number(formCotizacion.precio) }).eq("id", cotizarItem.id)
      fetchData() 
    }
    setShowCotizarModal(false)
    setShowPrevisualizarModal(true)
  }

  const generarTextoWhatsapp = () => {
    let txt = `¡Hola! Te paso la cotización 👇\n\n`
    txt += `📱 *${cotizarItem.equipo}*\n`
    txt += `• Condición: ${formCotizacion.condicion}\n`
    if (cotizarItem.bateria) txt += `• Batería: ${cotizarItem.bateria}%\n`
    txt += `• Garantía: ${formCotizacion.garantia}\n`
    txt += `• Disponibilidad: ${formCotizacion.disponibilidad}\n`
    if (formCotizacion.incluirImei && cotizarItem.imei) {
      txt += `• IMEI: •••• ${cotizarItem.imei.slice(-4)}\n`
    }
    txt += `\n💰 Precio: ${formCotizacion.moneda} ${formCotizacion.precio}\n\n`
    if (formCotizacion.observacion) txt += `${formCotizacion.observacion}\n\n`
    txt += `Electro·Nic\n\nCualquier consulta, escribime 🙌`
    return txt
  }

  const copiarMensaje = async () => {
    await navigator.clipboard.writeText(generarTextoWhatsapp())
    alert("¡Mensaje copiado al portapapeles!")
  }

  const enviarWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generarTextoWhatsapp())}`
    window.open(url, "_blank")
  }

  const puedeVerCosto = usuarioActual?.rol === "Dueño/a" || usuarioActual?.rol === "Administrador"
  const cantidadEnReparacion = equipos.filter(e => e.estado === "En Reparación").length

  return (
    <div className="p-6">
      
      {/* CABECERA Y SUB-PESTAÑAS */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4"><Package className="size-5 text-emerald-500"/> Gestión de Inventario</h3>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
            <button onClick={() => setActiveSubTab("disponibles")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeSubTab === "disponibles" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              Disponibles / Reservados
            </button>
            <button onClick={() => setActiveSubTab("reparacion")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2", activeSubTab === "reparacion" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              <Wrench className="size-3.5" /> En Reparación / Taller
              {cantidadEnReparacion > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cantidadEnReparacion}
                </span>
              )}
            </button>
            <button onClick={() => setActiveSubTab("vendidos")} className={cn("px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeSubTab === "vendidos" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
              Historial Vendidos
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button onClick={() => setShowImportModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"><Upload className="size-4"/> Importar</button>
          <button onClick={() => setShowExportModal(true)} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"><Download className="size-4"/> Exportar ({activeSubTab})</button>
          <button onClick={abrirNuevo} className="bg-emerald-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"><Plus className="size-4 font-black"/> Cargar Equipo</button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#161B22] border border-zinc-800 p-4 rounded-2xl mb-6 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5"><Filter className="size-3"/> Filtros de Búsqueda ({equiposFiltrados.length} resultados)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" /><input type="text" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Modelo, Capacidad, Color o IMEI..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all" /></div>
          <select value={filtroCondicion} onChange={e => setFiltroCondicion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 appearance-none transition-all">
            <option value="Todos">Todas las condiciones</option>
            {CONDICIONES.map(c => <option key={c} value={c}>Solo {c}</option>)}
          </select>
          <div className="relative group"><BatteryMedium className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500 group-focus-within:text-emerald-400" /><input type="number" value={filtroBateriaMinima} onChange={e => setFiltroBateriaMinima(e.target.value)} placeholder="Batería Mayor a (%)" className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-500/50 placeholder:font-normal" /></div>
          <div className="relative group"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-500 group-focus-within:text-sky-400" /><input type="number" value={filtroPrecioMaximo} onChange={e => setFiltroPrecioMaximo(e.target.value)} placeholder="Presupuesto Máximo" className="w-full bg-sky-500/5 border border-sky-500/20 text-sky-400 font-bold rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-sky-500 transition-all placeholder:text-sky-500/50 placeholder:font-normal" /></div>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      {loading ? <div className="py-20 flex justify-center"><Loader2 className="size-8 animate-spin text-emerald-500"/></div> : (
        <div className="overflow-x-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="p-4 rounded-tl-xl">Modelo & Especificaciones</th>
                <th className="p-4 text-center">Condición</th>
                <th className="p-4 text-center">% Batería</th>
                {puedeVerCosto && <th className="p-4 text-right">Costo (Base + Arreglos)</th>}
                <th className="p-4 text-right">Precios (May / Min)</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {equiposFiltrados.map(eq => {
                const partes = eq.equipo.split(" - ")
                const mod = partes[0] || eq.equipo
                const cap = partes[1]
                const col = partes[2]

                return (
                  <tr key={eq.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className={cn("font-black text-base flex items-center gap-2", eq.estado === "Vendido" ? "text-zinc-400" : "text-white")}>
                        {mod}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {cap && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">{cap}</span>}
                        {col && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">{col}</span>}
                        <span className="text-[10px] text-zinc-500 font-mono">IMEI: {eq.imei || "S/N"}</span>
                      </div>
                      {eq.observaciones && <p className="text-[10px] text-amber-500/80 italic mt-1 max-w-xs truncate">{eq.observaciones}</p>}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.condicion?.includes('Nuevo') ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : eq.condicion === 'Para reparar' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{eq.condicion || "N/A"}</span>
                    </td>
                    <td className="p-4 text-center text-zinc-400 font-bold">{eq.bateria ? `${eq.bateria}%` : "---"}</td>
                    
                    {puedeVerCosto && (
                      <td className="p-4 text-right">
                        <p className="font-black text-zinc-300">U$D {eq.costo_usd}</p>
                        {costoEnvioPromedio > 0 && (
                          <p className="text-[9px] text-zinc-500 flex items-center justify-end gap-1 mt-0.5" title="Flete Promedio Logístico Estimado">
                            <Truck className="size-3"/> + U$D {costoEnvioPromedio.toFixed(1)}
                          </p>
                        )}
                      </td>
                    )}

                    <td className="p-4 text-right">
                      <p className="font-black text-emerald-400 text-sm">May: U$D {eq.precio_venta_usd}</p>
                      <p className="font-bold text-sky-400 text-[10px] mt-0.5">Min: U$D {eq.precio_minorista_usd || "0"}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${eq.estado === 'Disponible' ? 'text-emerald-500 border-emerald-500/20' : eq.estado === 'En Reparación' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : eq.estado === 'Reservado' ? 'text-amber-500 border-amber-500/20' : 'text-zinc-500 border-zinc-700 bg-zinc-800'}`}>
                        {eq.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* 🚀 BOTÓN ALTA REPARADO */}
                        {eq.estado === "En Reparación" && (
                          <button onClick={() => abrirFinalizarReparacion(eq)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black rounded-lg transition-all text-[10px] font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="size-3.5"/> Alta Reparado
                          </button>
                        )}

                        {eq.estado === "Disponible" && (
                          <button onClick={() => abrirCotizacion(eq)} className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black rounded-lg transition-all" title="Cotizar / Enviar por WhatsApp"><Tag className="size-4"/></button>
                        )}
                        <button onClick={() => abrirEdicion(eq)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-sky-400 hover:bg-zinc-700 rounded-lg transition-all" title="Editar"><Edit3 className="size-4"/></button>
                        <button onClick={() => eliminarEquipo(eq.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-all" title="Eliminar"><Trash2 className="size-4"/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {equiposFiltrados.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-zinc-500 font-bold italic">No se encontraron equipos en esta sección.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 🛠️ MODAL: FINALIZAR REPARACIÓN Y SUMAR COSTO */}
      {showRepararModal && equipoEnReparacion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Wrench className="size-5 text-amber-400"/> Finalizar Reparación</h3>
              <button onClick={() => setShowRepararModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-5">
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <p className="text-sm font-bold text-white">{equipoEnReparacion.equipo}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">IMEI: {equipoEnReparacion.imei || "S/N"}</p>
                <p className="text-[10px] text-zinc-400 mt-2">Costo acumulado anterior: <strong className="text-white">USD ${equipoEnReparacion.costo_usd}</strong></p>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">Costo del Arreglo / Repuesto (USD)</label>
                <input 
                  type="number" 
                  value={costoReparacionUsd} 
                  onChange={e => setCostoReparacionUsd(e.target.value ? Number(e.target.value) : "")} 
                  placeholder="Ej: 35 (se suma al costo total)" 
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">Nueva Condición tras reparación</label>
                <select value={nuevaCondicionPosReparacion} onChange={e => setNuevaCondicionPosReparacion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500">
                  <option value="A+">A+ (Impecable)</option>
                  <option value="A">A (Excelente)</option>
                  <option value="A-">A- (Detalle mínimo)</option>
                  <option value="B">B (Uso moderado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-400 block mb-1">P. Mayorista (USD)</label>
                  <input type="number" value={nuevoPrecioMayorista} onChange={e => setNuevoPrecioMayorista(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-sky-400 block mb-1">P. Minorista (USD)</label>
                  <input type="number" value={nuevoPrecioMinorista} onChange={e => setNuevoPrecioMinorista(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2.5 outline-none focus:border-sky-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowRepararModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button type="button" onClick={handleConfirmarReparacionFinalizada} disabled={isSaving} className="px-8 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="size-5 animate-spin"/> : "Alta de Reparado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR EQUIPO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Smartphone className="size-5 text-emerald-400"/> {editingId ? "Editar equipo" : "Cargar equipo Apple"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-xl"><X className="size-5"/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 bg-[#161B22] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Tipo de equipo</label>
                  <select value={formUI.tipo} onChange={e => setFormUI({...formUI, tipo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    <option value="iPhone">iPhone</option><option value="iPad">iPad</option><option value="Mac">Mac</option><option value="Watch">Apple Watch</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Modelo *</label>
                  <select required value={formUI.modelo} onChange={e => setFormUI({...formUI, modelo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    {MODELOS_APPLE.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Capacidad</label>
                  <select value={formUI.capacidad} onChange={e => setFormUI({...formUI, capacidad: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    {CAPACIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Color</label>
                  <select value={formUI.color} onChange={e => setFormUI({...formUI, color: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    {COLORES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Batería (%)</label>
                  <input type="number" value={formUI.bateria} onChange={e => setFormUI({...formUI, bateria: e.target.value})} placeholder="Ej: 87" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Condición</label>
                  <select value={formUI.condicion} onChange={e => setFormUI({...formUI, condicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-white block mb-1.5">IMEI / N° de serie (si corresponde)</label>
                  <input type="text" value={formUI.imei} onChange={e => setFormUI({...formUI, imei: e.target.value})} placeholder="359412345678901" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                </div>

                {puedeVerCosto && (
                  <div>
                    <label className="text-xs font-bold text-white block mb-1.5 flex items-center gap-1"><DollarSign className="size-3 text-zinc-500"/> Costo Base (USD)</label>
                    <input required type="number" value={formUI.costo_usd} onChange={e => setFormUI({...formUI, costo_usd: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-emerald-500 block mb-1.5">P. Mayorista (USD)</label>
                    <input required type="number" value={formUI.precio_venta_usd} onChange={e => setFormUI({...formUI, precio_venta_usd: e.target.value})} className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-sky-500 block mb-1.5">P. Minorista (USD)</label>
                    <input required type="number" value={formUI.precio_minorista_usd} onChange={e => setFormUI({...formUI, precio_minorista_usd: e.target.value})} className="w-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Estado</label>
                  <select value={formUI.estado} onChange={e => setFormUI({...formUI, estado: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all">
                    <option value="Disponible">Disponible</option>
                    <option value="En Reparación">En Reparación</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Reservado">Reservado</option>
                  </select>
                </div>

                {!editingId && (
                  <div>
                    <label className="text-xs font-bold text-white block mb-1.5">Stock inicial (Cant.)</label>
                    <input type="number" min="1" value={formUI.stock_inicial} onChange={e => setFormUI({...formUI, stock_inicial: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all" />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-white block mb-1.5">Comentarios (opcional)</label>
                  <textarea value={formUI.comentarios} onChange={e => setFormUI({...formUI, comentarios: e.target.value})} placeholder="Notas internas..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all h-20 resize-none" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COTIZAR */}
      {showCotizarModal && cotizarItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white">Cotizar producto</h3>
              <button onClick={() => setShowCotizarModal(false)} className="text-zinc-500 hover:text-white"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-5">
              <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="p-3 bg-zinc-800 rounded-xl"><Smartphone className="size-6 text-zinc-400"/></div>
                <div>
                  <p className="text-sm font-bold text-white">{cotizarItem.equipo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Precio</label>
                  <input type="number" value={formCotizacion.precio} onChange={e => setFormCotizacion({...formCotizacion, precio: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white block mb-1">Moneda</label>
                  <select value={formCotizacion.moneda} onChange={e => setFormCotizacion({...formCotizacion, moneda: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button onClick={() => setShowCotizarModal(false)} className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800">Cancelar</button>
                <button onClick={avanzarAPrevisualizacion} className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 active:scale-95 transition-all">Previsualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVISUALIZAR */}
      {showPrevisualizarModal && cotizarItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white">Previsualizar y compartir</h3>
              <button onClick={() => setShowPrevisualizarModal(false)} className="text-zinc-500 hover:text-white"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 bg-[#161B22] space-y-6">
              <div className="bg-white rounded-2xl p-4 text-black text-sm whitespace-pre-wrap font-sans shadow-inner">
                {generarTextoWhatsapp()}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={copiarMensaje} className="flex-1 px-4 py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all">
                  <Copy className="size-4"/> Copiar
                </button>
                <button onClick={enviarWhatsApp} className="flex-[1.5] px-4 py-3.5 bg-[#25D366] text-white font-black rounded-xl hover:bg-[#20bd5a] active:scale-95 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20">
                  <MessageCircle className="size-5"/> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL EXPORTAR CONFIGURABLE (ESTRUCTURA DE SEGUNDA CAPTURA) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in text-left">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><CheckSquare className="size-5 text-sky-400"/> Seleccionar Columnas a Exportar</h3>
              <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-900 transition-colors"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 space-y-3 bg-[#161B22] max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-zinc-400 mb-2">Elegí qué datos incluir en la planilla Excel (.xlsx):</p>

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">Batería (%)</span>
                <input type="checkbox" checked={exportOptions.bateria} onChange={e => setExportOptions({...exportOptions, bateria: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">IMEI / N° Serie</span>
                <input type="checkbox" checked={exportOptions.imei} onChange={e => setExportOptions({...exportOptions, imei: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              {puedeVerCosto && (
                <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                  <span className="text-sm font-bold text-white">Costo Base (USD)</span>
                  <input type="checkbox" checked={exportOptions.costo} onChange={e => setExportOptions({...exportOptions, costo: e.target.checked})} className="size-5 accent-sky-500" />
                </label>
              )}

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">Precio Mayorista (USD)</span>
                <input type="checkbox" checked={exportOptions.precioMayorista} onChange={e => setExportOptions({...exportOptions, precioMayorista: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">Precio Minorista (USD)</span>
                <input type="checkbox" checked={exportOptions.precioMinorista} onChange={e => setExportOptions({...exportOptions, precioMinorista: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">Estado (Disponible / Vendido)</span>
                <input type="checkbox" checked={exportOptions.estado} onChange={e => setExportOptions({...exportOptions, estado: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-all">
                <span className="text-sm font-bold text-white">Comentarios / Notas</span>
                <input type="checkbox" checked={exportOptions.comentarios} onChange={e => setExportOptions({...exportOptions, comentarios: e.target.checked})} className="size-5 accent-sky-500" />
              </label>

              <button onClick={ejecutarExportacion} className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                <Download className="size-5" /> Descargar Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><FileSpreadsheet className="size-5 text-sky-400"/> Importar Stock Masivo</h3>
              <button onClick={() => setShowImportModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-xl bg-zinc-900"><X className="size-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-sky-400">Plantilla de Ejemplo</h4>
                  <p className="text-xs text-zinc-300">Estructura exacta para evitar fallos.</p>
                </div>
                <button type="button" onClick={descargarPlantillaCSV} className="bg-sky-500 hover:bg-sky-400 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <Download className="size-4"/> Descargar Ejemplo
                </button>
              </div>

              <div>
                <input 
                  type="file" 
                  accept=".csv, .numbers, .xlsx, .xls" 
                  ref={fileInputRef} 
                  onChange={handleImportarCSV} 
                  className="hidden" 
                  id="csvUpload" 
                />
                <label htmlFor="csvUpload" className={cn("w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all", isImporting ? "border-zinc-700 bg-zinc-900 pointer-events-none" : "border-zinc-700 hover:border-sky-500 bg-zinc-950")}>
                  {isImporting ? <Loader2 className="size-10 text-sky-500 animate-spin mb-3" /> : <Upload className="size-10 text-zinc-500 mb-3" />}
                  <span className="text-sm font-black text-white">Seleccionar archivo (.CSV, .Numbers, .XLSX)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}