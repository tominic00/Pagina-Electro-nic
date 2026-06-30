"use client"

import { useState, useEffect, useRef } from "react"
import { Edit3, Plus, Loader2, X, FileText, Link2, ClipboardCheck, Trash2, Bold, Italic, Heading1, Heading2, List } from "lucide-react"

interface TabGuiasProps {
  formDataGuia: any
  setFormDataGuia: (data: any) => void
  handleSaveGuia: (e: React.FormEvent) => void
  isSavingGuia: boolean
  guias: any[]
  deleteGuia: (id: string) => void
  editingGuiaId: string | null
  setEditingGuiaId: (id: string | null) => void
}

export function TabGuias({
  formDataGuia = {},
  setFormDataGuia,
  handleSaveGuia,
  isSavingGuia,
  guias = [],
  deleteGuia,
  editingGuiaId,
  setEditingGuiaId
}: TabGuiasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // 🛡 * SINCRO SEGURA: Previene crashes y refrescos molestos al alternar guías o limpiar estados
  useEffect(() => {
    if (editorRef.current) {
      const htmlActual = editorRef.current.innerHTML
      const htmlObjetivo = formDataGuia?.contenido || ""
      if (htmlActual !== htmlObjetivo) {
        editorRef.current.innerHTML = htmlObjetivo
      }
    }
  }, [editingGuiaId, formDataGuia?.contenido])

  const handleCopyLink = (id: string) => {
    const urlCompleta = `/guias/${id}`
    navigator.clipboard.writeText(urlCompleta)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current && formDataGuia) {
      formDataGuia.contenido = editorRef.current.innerHTML
    }
  }

  const insertarEnlaceInteligente = () => {
    const url = prompt("Ingresá la URL de la guía (ej: /guias/instrucciones-de-uso):")
    if (!url) return

    const seleccion = window.getSelection()
    if (seleccion && seleccion.rangeCount > 0) {
      const range = seleccion.getRangeAt(0)
      let textoSeleccionado = range.toString()

      if (!textoSeleccionado) {
        textoSeleccionado = prompt("Ingresá el texto que verá el usuario (ej: click aquí para instrucciones):") || "enlace"
      }

      const linkHTML = `<a href="${url}" style="color: #00d2ff; text-decoration: underline; font-weight: bold;">${textoSeleccionado}</a>`
      document.execCommand("insertHTML", false, linkHTML)
      
      if (editorRef.current && formDataGuia) {
        formDataGuia.contenido = editorRef.current.innerHTML
      }
    }
  }

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* FORMULARIO DE CREACIÓN */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-semibold text-[#081640]">
            {editingGuiaId ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
            {editingGuiaId ? "Editar Guía Científica" : "Nueva Guía / Protocolo"}
          </h2>
          
          <form onSubmit={handleSaveGuia} className="space-y-4 text-left">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Identificador Único (Link Corto)</label>
              <input 
                required 
                type="text" 
                placeholder="ej: guia-reconstitucion-2ml"
                disabled={!!editingGuiaId}
                value={formDataGuia?.id || ""} 
                onChange={e => setFormDataGuia({...formDataGuia, id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')})} 
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 text-xs outline-none focus:border-cyan-rx disabled:opacity-50 font-mono" 
              />
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Título de la Guía</label>
              <input 
                required 
                type="text" 
                placeholder="ej: Protocolo de Reconstitución"
                value={formDataGuia?.titulo || ""} 
                onChange={e => setFormDataGuia({...formDataGuia, titulo: e.target.value})} 
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 text-xs outline-none focus:border-cyan-rx" 
              />
            </div>

            {/* EDITOR ENRIQUECIDO */}
            <div className="flex flex-col border border-silver/30 rounded-xl overflow-hidden bg-white">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary/40 p-2 bg-gray-50 border-b border-silver/20 block">Contenido del Protocolo</span>
              
              <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/50 border-b border-silver/20">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Negrita"><Bold className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Itálica"><Italic className="size-3.5" /></button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center gap-0.5" title="Título"><Heading1 className="size-3.5" /><span className="text-[9px] font-bold">H1</span></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h3>"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center gap-0.5" title="Subtítulo"><Heading2 className="size-3.5" /><span className="text-[9px] font-bold">H2</span></button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Lista"><List className="size-3.5" /></button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertarEnlaceInteligente(); }} className="p-1.5 rounded bg-cyan-rx/10 text-cyan-rx border border-cyan-rx/20 hover:bg-cyan-rx hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold" title="Insertar Link de Guía">
                  <Link2 className="size-3.5" /> Enlace
                </button>

                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#00d2ff"); }} className="p-1 rounded-full border border-gray-300 bg-[#00d2ff] size-4 hover:scale-110 transition-transform" title="Celeste" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#081640"); }} className="p-1 rounded-full border border-gray-300 bg-[#081640] size-4 hover:scale-110 transition-transform" title="Azul Marino" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#C5A880"); }} className="p-1 rounded-full border border-gray-300 bg-[#C5A880] size-4 hover:scale-110 transition-transform" title="Dorado Champagne" />
              </div>

              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onInput={() => { if (editorRef.current && formDataGuia) formDataGuia.contenido = editorRef.current.innerHTML; }}
                onBlur={() => { if (editorRef.current && formDataGuia) formDataGuia.contenido = editorRef.current.innerHTML; }}
                className="p-3 min-h-[220px] max-h-[350px] overflow-y-auto text-xs focus:outline-none prose prose-sm text-primary text-left bg-white"
                style={{ whiteSpace: "normal" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSavingGuia} 
              className="w-full flex items-center justify-center rounded-xl bg-[#081640] py-2.5 text-xs font-bold uppercase text-white hover:bg-cyan-rx hover:text-[#081640] transition-colors"
            >
              {isSavingGuia ? <Loader2 className="size-4 animate-spin"/> : editingGuiaId ? "Guardar Cambios" : "Publicar Guía"}
            </button>
          </form>
        </div>
      </div>

      {/* TABLA DE BIBLIOTECA */}
      <div className="xl:col-span-3 text-left">
        <div className="mb-4">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#081640]">Biblioteca de Protocolos e Instrucciones</h2>
          <p className="text-xs text-primary/50 leading-tight">Tu viejo puede crear las guías acá, copiar el código del enlace y pegarlo en cualquier descripción de producto.</p>
        </div>

        <div className="rounded-2xl border border-silver/20 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/40">
              <tr>
                <th className="p-4">Título del Protocolo</th>
                <th className="p-4">Ruta de Enlace</th>
                <th className="p-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {guias?.map((guia) => (
                <tr key={guia.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-cyan-rx shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-[#081640]">{guia.titulo}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-primary/60">/guias/{guia.id}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => handleCopyLink(guia.id)} className={`flex items-center gap-1 text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg border transition-all ${copiedId === guia.id ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-cyan-rx/10 hover:text-primary"}`}>
                        {copiedId === guia.id ? "¡Copiado!" : "Copiar Link"}
                      </button>
                      <button type="button" onClick={() => { setEditingGuiaId(guia.id); setFormDataGuia({ id: guia.id, titulo: guia.titulo, contenido: guia.contenido }) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-cyan-rx"><Edit3 className="size-4" /></button>
                      <button type="button" onClick={() => deleteGuia(guia.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}