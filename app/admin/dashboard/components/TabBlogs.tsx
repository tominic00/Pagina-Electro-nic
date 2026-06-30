"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, FileText, Link2, ClipboardCheck, Trash2, Bold, Italic, List, Heading1, Heading2 } from "lucide-react"

interface TabBlogsProps {
  formDataBlog: any
  setFormDataBlog: React.Dispatch<React.SetStateAction<any>>
  handleSaveBlog: (e: React.FormEvent) => void
  isSavingBlog: boolean
  blogs: any[]
  deleteBlog: (id: string) => void
  editingBlogId: string | null
  setEditingBlogId: (id: string | null) => void
}

export function TabBlogs({
  formDataBlog = {},
  setFormDataBlog,
  handleSaveBlog,
  isSavingBlog,
  blogs = [],
  deleteBlog,
  editingBlogId,
  setEditingBlogId
}: TabBlogsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // 🛡️ SINCRO SEGURA DEL EDITOR: Solo inyecta el HTML cuando se selecciona un artículo diferente
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formDataBlog?.contenido || ""
    }
  }, [editingBlogId])

  useEffect(() => {
    if (formDataBlog.contenido === "" && editorRef.current) {
      editorRef.current.innerHTML = ""
    }
  }, [formDataBlog.contenido === ""])

  const ejecutarComando = (comando: string, valor: string = "") => {
    document.execCommand(comando, false, valor)
    if (editorRef.current && formDataBlog) {
      formDataBlog.contenido = editorRef.current.innerHTML
    }
  }

  const insertarEnlaceInteligente = () => {
    const url = prompt("Ingresá la URL de destino (ej: /guias/instrucciones-de-uso o un link externo):")
    if (!url) return

    const seleccion = window.getSelection()
    if (seleccion && seleccion.rangeCount > 0) {
      const range = seleccion.getRangeAt(0)
      let textoSeleccionado = range.toString()

      if (!textoSeleccionado) {
        textoSeleccionado = prompt("Texto visible del enlace (ej: ver guía médica):") || "enlace"
      }

      const linkHTML = `<a href="${url}" style="color: #00d2ff; text-decoration: underline; font-weight: bold;">${textoSeleccionado}</a>`
      document.execCommand("insertHTML", false, linkHTML)
      
      if (editorRef.current && formDataBlog) {
        formDataBlog.contenido = editorRef.current.innerHTML
      }
    }
  }

  const handleCopyLink = (id: string) => {
    const urlCompleta = window.location.origin + "/blog/" + id
    navigator.clipboard.writeText(urlCompleta)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categoriasExistentes = Array.from(
    new Set(blogs.map((b) => b.categoria).filter(Boolean))
  )

  return (
    <div className="grid gap-6 sm:gap-10 grid-cols-1 xl:grid-cols-4 animate-in fade-in duration-500 text-left">
      
      {/* FORMULARIO BLINDADO ANTI-LOSS FOCUS */}
      <div className="xl:col-span-1">
        <div className="xl:sticky xl:top-28 rounded-2xl sm:rounded-3xl border border-silver/20 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-semibold text-[#081640]">
            {editingBlogId ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
            {editingBlogId ? "Editar Artículo" : "Nuevo Artículo / FAQ"}
          </h2>
          
          {/* 🚀 CLAVE DINÁMICA: Reinicia los valores por defecto limpiamente sin romper el cursor mientras escribís */}
          <form key={editingBlogId || 'nuevo'} onSubmit={handleSaveBlog} className="space-y-4 text-left">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">URL Corta (Slug)</label>
              <input 
                required 
                type="text" 
                placeholder="ej: instrucciones-de-compra" 
                disabled={!!editingBlogId} 
                defaultValue={formDataBlog?.id || ""} 
                onChange={e => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                  e.target.value = val;
                  formDataBlog.id = val;
                }} 
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 text-xs outline-none focus:border-cyan-rx disabled:opacity-50 font-mono" 
              />
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Categoría del Contenido</label>
              <input 
                required
                type="text" 
                list="listado-categorias"
                placeholder="Escribí una nueva o seleccioná..."
                defaultValue={formDataBlog?.categoria || ""} 
                onChange={e => { formDataBlog.categoria = e.target.value; }} 
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 text-xs outline-none focus:border-cyan-rx" 
              />
              <datalist id="listado-categorias">
                <option value="Novedades & Actualizaciones" />
                <option value="Instrucciones de Compra" />
                <option value="Formas de Pago" />
                <option value="Preguntas Frecuentes" />
                <option value="Sobre Nosotros" />
                {categoriasExistentes.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/40">Título Informativo</label>
              <input 
                required 
                type="text" 
                placeholder="ej: ¿Cómo realizar tu pago?" 
                defaultValue={formDataBlog?.titulo || ""} 
                onChange={e => { formDataBlog.titulo = e.target.value; }} 
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 p-2.5 text-xs outline-none focus:border-cyan-rx" 
              />
            </div>

            {/* EDITOR ENRIQUECIDO */}
            <div className="flex flex-col border border-silver/30 rounded-xl overflow-hidden bg-white">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary/40 p-2 bg-gray-50 border-b border-silver/20 block">Cuerpo del Artículo</span>
              
              <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/50 border-b border-silver/20">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Negrita"><Bold className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Itálica"><Italic className="size-3.5" /></button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-xs" title="Título Principal">H1</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h3>"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-xs" title="Subtítulo">H2</button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Lista"><List className="size-3.5" /></button>
                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertarEnlaceInteligente(); }} className="p-1.5 rounded bg-cyan-rx/10 text-cyan-rx border border-cyan-rx/20 hover:bg-cyan-rx hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold" title="Insertar Enlace">
                  <Link2 className="size-3.5" /> Enlace
                </button>

                <div className="h-4 w-px bg-silver/30 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#081640"); }} className="rounded-full bg-[#081640] size-4 border border-gray-300" title="Azul Marino Corp" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#00d2ff"); }} className="rounded-full bg-[#00d2ff] size-4 border border-gray-300" title="Cyan RX" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("foreColor", "#C5A880"); }} className="rounded-full bg-[#C5A880] size-4 border border-gray-300" title="Dorado Champagne" />
              </div>

              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onInput={() => { if (editorRef.current && formDataBlog) formDataBlog.contenido = editorRef.current.innerHTML; }}
                onBlur={() => { if (editorRef.current && formDataBlog) formDataBlog.contenido = editorRef.current.innerHTML; }}
                className="p-3 min-h-[250px] max-h-[400px] overflow-y-auto text-xs focus:outline-none bg-white text-left text-primary"
                style={{ whiteSpace: "normal" }}
              />
            </div>

            <button type="submit" disabled={isSavingBlog} className="w-full flex items-center justify-center rounded-xl bg-[#081640] py-2.5 text-xs font-bold uppercase text-white hover:bg-cyan-rx hover:text-[#081640] transition-colors">
              {isSavingBlog ? <Loader2 className="size-4 animate-spin"/> : editingBlogId ? "Guardar Cambios" : "Publicar en la Web"}
            </button>
          </form>
        </div>
      </div>

      {/* TABLA DE ARTÍCULOS */}
      <div className="xl:col-span-3 text-left">
        <div className="mb-4">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#081640]">Artículos e Institucionales Activos</h2>
          <p className="text-xs text-primary/50 leading-tight">Administración dinámica de la sección informativa global de RxWellHealth.</p>
        </div>

        <div className="rounded-2xl border border-silver/20 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/40">
              <tr>
                <th className="p-4">Título / Sección</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Enlace Público</th>
                <th className="p-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4"><span className="font-bold text-xs sm:text-sm text-[#081640]">{item.titulo}</span></td>
                  <td className="p-4"><span className="px-2 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase text-primary/60">{item.categoria}</span></td>
                  <td className="p-4 font-mono text-xs text-primary/60">/blog/{item.id}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => handleCopyLink(item.id)} className={`flex items-center gap-1 text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg border transition-all ${copiedId === item.id ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-cyan-rx/10 hover:text-primary"}`}>
                        {copiedId === item.id ? <ClipboardCheck className="size-3"/> : <Link2 className="size-3"/>}
                        {copiedId === item.id ? "¡Copiado!" : "Copiar Link"}
                      </button>
                      <button type="button" onClick={() => { setEditingBlogId(item.id); setFormDataBlog({ id: item.id, titulo: item.titulo, categoria: item.categoria, contenido: item.contenido }); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-cyan-rx"><Edit3 className="size-4" /></button>
                      <button type="button" onClick={() => deleteBlog(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-primary/30 font-medium">No hay artículos ni FAQs creados todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}