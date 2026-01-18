/**
 * TESTE VANILLA - Frappe Gantt
 * Componente de teste minimalista sem customizações
 */

import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function GanttTestVanilla() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('🧪 [TESTE VANILLA] Iniciando...');

    // Dados de teste simples
    const tasks = [
      {
        id: 'Task 1',
        name: 'Tarefa 1 - Simples',
        start: '2024-03-01',
        end: '2024-03-05',
        progress: 50,
      },
      {
        id: 'Task 2',
        name: 'Tarefa 2 - Média',
        start: '2024-03-06',
        end: '2024-03-12',
        progress: 30,
      },
      {
        id: 'Task 3',
        name: 'Tarefa 3 - Longa',
        start: '2024-03-13',
        end: '2024-03-25',
        progress: 0,
      },
    ];

    console.log('🧪 [TESTE VANILLA] Tarefas:', tasks);
    console.log('🧪 [TESTE VANILLA] Container:', containerRef.current);

    try {
      // Criar instância com configuração MÍNIMA
      const gantt = new Gantt(containerRef.current, tasks, {
        view_mode: 'Week',
      });

      console.log('🧪 [TESTE VANILLA] ✅ Gantt criado com sucesso!', gantt);

      // Inspecionar SVG
      setTimeout(() => {
        const svg = containerRef.current?.querySelector('svg');
        const bars = containerRef.current?.querySelectorAll('.bar-wrapper');
        const rects = containerRef.current?.querySelectorAll('rect');

        console.log('🧪 [TESTE VANILLA] INSPEÇÃO:');
        console.log('  SVG:', svg);
        console.log('  SVG width:', svg?.getAttribute('width'));
        console.log('  SVG height:', svg?.getAttribute('height'));
        console.log('  Total de barras (.bar-wrapper):', bars?.length);
        console.log('  Total de retângulos (rect):', rects?.length);

        if (bars && bars.length > 0) {
          const firstBar = bars[0];
          const barRect = firstBar.querySelector('.bar');
          console.log('  Primeira barra:', {
            element: firstBar,
            rect: barRect,
            fill: barRect?.getAttribute('fill'),
            width: barRect?.getAttribute('width'),
            height: barRect?.getAttribute('height'),
            x: barRect?.getAttribute('x'),
            y: barRect?.getAttribute('y'),
          });
        }
      }, 500);
    } catch (error) {
      console.error('🧪 [TESTE VANILLA] ❌ ERRO:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', height: '100vh', background: '#fff' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Button variant="ghost" size="icon" onClick={() => navigate('/cronograma')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          🧪 TESTE VANILLA - Frappe Gantt
        </h1>
      </div>

      <div style={{ background: '#f0f0f0', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
          Instruções:
        </h2>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '20px' }}>
          <li>Este é um teste vanilla (puro) do frappe-gantt</li>
          <li>SEM customizações CSS</li>
          <li>SEM manipulação DOM</li>
          <li>SEM estilos inline</li>
          <li>Apenas a biblioteca em sua forma mais básica</li>
          <li><strong>Verifique o console do navegador para logs detalhados</strong></li>
        </ul>
      </div>

      <div style={{ background: '#e8f4f8', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#0369a1' }}>
          ❓ O que observar:
        </h3>
        <ol style={{ fontSize: '13px', lineHeight: '1.6', listStyleType: 'decimal', paddingLeft: '20px' }}>
          <li>Você consegue ver 3 barras horizontais coloridas abaixo?</li>
          <li>As barras têm cores diferentes (azul/verde)?</li>
          <li>Há labels com os nomes das tarefas?</li>
          <li>Há uma grade de fundo com datas?</li>
        </ol>
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '400px',
          border: '2px solid #333',
          background: '#ffffff',
        }}
      ></div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#92400e' }}>
          📊 Resultado Esperado:
        </h3>
        <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
          Se o frappe-gantt estiver funcionando corretamente, você deve ver:
        </p>
        <ul style={{ fontSize: '13px', lineHeight: '1.6', listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
          <li>3 barras horizontais coloridas (azul/verde)</li>
          <li>Nomes das tarefas à esquerda de cada barra</li>
          <li>Grade de fundo com meses/semanas</li>
          <li>Header com datas</li>
        </ul>
        <p style={{ fontSize: '13px', lineHeight: '1.6', marginTop: '8px', fontWeight: 'bold' }}>
          Se você NÃO ver as barras, o problema é a biblioteca frappe-gantt em si.
        </p>
      </div>
    </div>
  );
}
