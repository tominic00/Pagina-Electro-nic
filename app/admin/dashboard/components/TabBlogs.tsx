"use client"

import { useEffect, useRef, useState } from "react"
import { Edit3, Plus, Loader2, Link2, ClipboardCheck, Trash2, Bold, Italic, List, FileText } from "lucide-react"

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

  // 🛡️ SINCRO SEGURA DEL EDITOR
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
    const url = prompt("Ingresá la URL de destino (ej: /iphone-13 o un link externo):")
    if (!url) return

    const seleccion = window.getSelection()
    if (seleccion && seleccion.rangeCount > 0) {
      const range = seleccion.getRangeAt(0)
      let textoSeleccionado = range.toString()

      if (!textoSeleccionado) {
        textoSeleccionado = prompt("Texto visible del enlace:") || "Ver aquí"
      }

      // Estilo adaptado al theme tecnológico (Purple)
      const linkHTML = `<a href="${url}" style="color: #a855f7; text-decoration: underline; font-weight: bold;">${textoSeleccionado}</a>`
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
    <div className="grid gap-6 sm:gap-8 grid-cols-1 xl:grid-cols-12 animate-in fade-in duration-500 text-left w-full">
      
      {/* 🚀 PANEL IZQUIERDO: REDACTOR DE ARTÍCULOS */}
      <div className="xl:col-span-5 flex flex-col h-full">
        <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl xl:sticky xl:top-28 space-y-6">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black text-white tracking-tight">
            {editingBlogId ? <Edit3 className="size-5 text-purple-500" /> : <Plus className="size-5 text-purple-500" />}
            {editingBlogId ? "Editar Artículo" : "Redactar Artículo"}
          </h2>
          
          <form key={editingBlogId || 'nuevo'} onSubmit={handleSaveBlog} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL / Slug</label>
                <input 
                  required 
                  type="text" 
                  placeholder="ej: bateria-iphone" 
                  disabled={!!editingBlogId} 
                  defaultValue={formDataBlog?.id || ""} 
                  onChange={e => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                    e.target.value = val;
                    formDataBlog.id = val;
                  }} 
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all disabled:opacity-50 font-mono" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Categoría</label>
                <input 
                  required
                  type="text" 
                  list="listado-categorias"
                  placeholder="Elegir o crear..."
                  defaultValue={formDataBlog?.categoria || ""} 
                  onChange={e => { formDataBlog.categoria = e.target.value; }} 
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all" 
                />
                <datalist id="listado-categorias">
                  <option value="Tutoriales & Tips" />
                  <option value="Noticias Apple" />
                  <option value="Novedades del Local" />
                  {categoriasExistentes.map((cat: any) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Título Informativo</label>
              <input 
                required 
                type="text" 
                placeholder="ej: ¿Cómo realizar tu pago?" 
                defaultValue={formDataBlog?.titulo || ""} 
                onChange={e => { formDataBlog.titulo = e.target.value; }} 
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-700 outline-none focus:border-purple-500 transition-all" 
              />
            </div>

            {/* EDITOR ENRIQUECIDO */}
            <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 p-2 bg-zinc-900 border-b border-zinc-800 block">Cuerpo del Artículo</span>
              
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-zinc-900/50 border-b border-zinc-800">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("bold"); }} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Negrita"><Bold className="size-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("italic"); }} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Itálica"><Italic className="size-3.5" /></button>
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h2>"); }} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white font-black text-[10px] uppercase transition-colors" title="Título Principal">H1</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("formatBlock", "<h3>"); }} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white font-black text-[10px] uppercase transition-colors" title="Subtítulo">H2</button>
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarComando("insertUnorderedList"); }} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Lista"><List className="size-3.5" /></button>
                <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertarEnlaceInteligente(); }} className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold" title="Insertar Enlace">
                  <Link2 className="size-3.5" /> Enlace
                </button>
              </div>

              <div
                ref={editorRef}
                suppressContentEditableWarning={true}
                contentEditable
                onInput={() => { if (editorRef.current && formDataBlog) formDataBlog.contenido = editorRef.current.innerHTML; }}
                onBlur={() => { if (editorRef.current && formDataBlog) formDataBlog.contenido = editorRef.current.innerHTML; }}
                className="p-4 min-h-[250px] max-h-[400px] overflow-y-auto text-sm focus:outline-none bg-zinc-950 text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800"
                style={{ whiteSpace: "normal" }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingBlogId && (
                <button type="button" onClick={() => { setEditingBlogId(null); setFormDataBlog({ id: "", titulo: "", categoria: "Tutoriales & Tips", contenido: "" }) }} className="flex-1 py-3 text-xs font-bold uppercase bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-all">Cancelar</button>
              )}
              <button type="submit" disabled={isSavingBlog} className="flex-2 w-full flex items-center justify-center rounded-xl bg-purple-600 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-purple-500 transition-all active:scale-95 shadow-md disabled:opacity-50">
                {isSavingBlog ? <Loader2 className="size-4 animate-spin"/> : editingBlogId ? "Guardar Cambios" : "Publicar Artículo"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🚀 PANEL DERECHO: ARTÍCULOS PUBLICADOS */}
      <div className="xl:col-span-7 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Blog Público</h2>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Artículos visibles en tu web</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            En Vivo
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#161B22] shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="p-4 pl-6">Título / Artículo</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">URL Pública</th>
                  <th className="p-4 text-center pr-6 w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {blogs?.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-sm text-zinc-200 block truncate max-w-[200px]" title={item.titulo}>{item.titulo}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-500">
                      /blog/{item.id}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => handleCopyLink(item.id)} 
                          className={`p-2 rounded-lg transition-colors border ${copiedId === item.id ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"}`}
                          title="Copiar Enlace"
                        >
                          {copiedId === item.id ? <ClipboardCheck className="size-4"/> : <Link2 className="size-4"/>}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setEditingBlogId(item.id); setFormDataBlog({ id: item.id, titulo: item.titulo, categoria: item.categoria, contenido: item.contenido }); }} 
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-purple-400 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => deleteBlog(item.id)} 
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-sm font-semibold italic text-zinc-600">
                      No hay artículos redactados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  )
}