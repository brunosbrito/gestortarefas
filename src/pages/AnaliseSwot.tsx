import React from 'react';
import Layout from '@/components/Layout';
import { SwotAnalysis } from '@/components/dashboard/SwotAnalysis';
import { TrendingUp, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AnaliseSwot = () => {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header da página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análise SWOT</h1>
            <p className="text-gray-600 mt-2">
              Análise estratégica das Forças, Fraquezas, Oportunidades e Ameaças
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Cards informativos sobre SWOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Forças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-700 text-xs">
                Fatores internos positivos que dão vantagem competitiva
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Fraquezas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-yellow-700 text-xs">
                Aspectos internos que precisam ser melhorados
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-700 text-xs">
                Fatores externos que podem ser aproveitados
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Ameaças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-red-700 text-xs">
                Riscos externos que devem ser monitorados
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Componente principal de análise SWOT */}
        <div className="bg-white rounded-lg shadow-sm border">
          <SwotAnalysis />
        </div>

        {/* Seção de insights e recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Insights e Recomendações Estratégicas
            </CardTitle>
            <CardDescription>
              Baseado na análise SWOT atual do projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">📈 Estratégias de Crescimento</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Aproveite as forças para explorar oportunidades</li>
                  <li>• Invista em pontos fortes identificados</li>
                  <li>• Maximize vantagens competitivas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">🛡️ Gestão de Riscos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monitore ameaças identificadas</li>
                  <li>• Desenvolva planos de contingência</li>
                  <li>• Fortaleça pontos fracos críticos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AnaliseSwot;