import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Función para verificar si es una instancia final
 * @param {Object} jornada - Objeto de jornada
 * @returns {boolean} - True si es instancia final
 */
const esInstanciaFinal = (jornada) => {
  const instanciasFinales = ["Final", "Semifinal", "Cuartos", "Octavos"];
  if (!jornada.nombreJornada) return false;
  
  // Verificar si el nombre contiene alguna instancia final (incluyendo variantes con "Vuelta")
  return instanciasFinales.some(instancia => 
    jornada.nombreJornada.includes(instancia)
  );
};

/**
 * Exporta las jornadas activas de un torneo a PDF
 * @param {Array} jornadas - Array de jornadas del torneo
 * @param {Object} torneoSeleccionado - Objeto del torneo seleccionado
 * @returns {Promise<void>}
 */
export const exportarJornadasActivasAPDF = (jornadas, torneoSeleccionado) => {
  try {
    // Filtrar solo las jornadas activas
    const jornadasActivas = jornadas.filter(jornada => jornada.activa === 1);
    
    if (jornadasActivas.length === 0) {
      alert("No hay jornadas activas para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    // Configurar fuente y título
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Jornadas Activas', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`${torneoSeleccionado?.nombre || 'Torneo'}`, 105, 35, { align: 'center' });
    doc.text(`Tipo: ${torneoSeleccionado?.tipoTorneo === 2 ? 'Torneo por Grupos' : 'Torneo General'}`, 105, 45, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 105, 55, { align: 'center' });

    let yPosition = 65;

    // Procesar cada jornada activa - Ordenar por número de jornada ascendente (1, 2, 3...)
    jornadasActivas
      .sort((a, b) => {
        // Si tienen numeroJornada, usar ese campo
        if (a.numeroJornada && b.numeroJornada) {
          return a.numeroJornada - b.numeroJornada;
        }
        // Si no, usar idJornda ascendente
        return a.idJornda - b.idJornda;
      })
      .forEach((jornada, index) => {
        // Cada jornada en una página nueva (excepto la primera)
        if (index > 0) {
          doc.addPage();
          yPosition = 20;
        }

        // Título de la jornada
        doc.setFontSize(14);
        doc.setTextColor(255, 107, 107); // Color del gradiente
        const nombreJornada = jornada.nombreJornada && jornada.nombreJornada !== "" 
          ? jornada.nombreJornada 
          : `Jornada ${jornada.numeroJornada}`;
        
        doc.text(nombreJornada, 20, yPosition);
        yPosition += 10;

        // Información de la jornada
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        let infoText = `ID: ${jornada.idJornda}`;
        if (jornada.fechaInicioString) infoText += ` | Inicio: ${jornada.fechaInicioString}`;
        if (jornada.fechaFinString) infoText += ` | Fin: ${jornada.fechaFinString}`;
        
        doc.text(infoText, 20, yPosition);
        yPosition += 8;

        // Estados
        let estadosText = `Estado: ACTIVA`;
        estadosText += jornada.cerrada === 1 ? ' | CERRADA' : ' | ABIERTA';
        if (esInstanciaFinal(jornada)) estadosText += ' | INSTANCIA FINAL';
        
        doc.setTextColor(0, 150, 0); // Verde para activa
        doc.text(estadosText, 20, yPosition);
        yPosition += 15;

        // Tabla de partidos si existen
        if (jornada.jornada && jornada.jornada.length > 0) {
          const partidosData = jornada.jornada.map(partido => [
            partido.nombreEquipoLocal || 'TBD',
            `${partido.golesLocal ?? '-'} - ${partido.golesVisita ?? '-'}`,
            partido.nombreEquipoVisita || 'TBD'
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Equipo Local', 'Resultado', 'Equipo Visitante']],
            body: partidosData,
            theme: 'plain',
            headStyles: {
              fillColor: [255, 107, 107], // Color del gradiente
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 8,
              cellPadding: 2
            },
            bodyStyles: {
              fontSize: 7,
              textColor: [40, 40, 40],
              cellPadding: 1.5
            },
            alternateRowStyles: {
              fillColor: [252, 252, 252]
            },
            columnStyles: {
              0: { cellWidth: 65, halign: 'left' },
              1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
              2: { cellWidth: 65, halign: 'right' }
            },
            margin: { left: 20, right: 20 },
            styles: {
              cellPadding: 1.5,
              lineWidth: 0.05,
              lineColor: [230, 230, 230],
              fontSize: 7
            }
          });

          yPosition = doc.lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No hay partidos programados para esta jornada.', 20, yPosition);
          yPosition += 20;
        }

        // Como cada jornada está en su propia página, no necesitamos línea separadora
      });

    // Pie de página en todas las páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, 105, 285, { align: 'center' });
      doc.text('FIFA App - Administración de Torneos', 105, 290, { align: 'center' });
    }

    // Generar nombre del archivo
    const fechaHoy = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Jornadas_Activas_${torneoSeleccionado?.nombre?.replace(/\s+/g, '_') || 'Torneo'}_${fechaHoy}.pdf`;

    // Descargar el PDF
    doc.save(nombreArchivo);
    
    alert(`PDF exportado exitosamente: ${nombreArchivo}\n\nJornadas activas incluidas: ${jornadasActivas.length}`);

  } catch (error) {
    console.error('Error al exportar PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta nuevamente.');
  }
};