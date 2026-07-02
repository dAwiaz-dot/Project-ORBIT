# Manual de importacao de planilhas - Orbit Leads

Este manual define o padrao para importar leads por Excel ou CSV no Orbit Leads.

## Formatos aceitos

- `.xlsx`
- `.csv` com separador virgula
- UTF-8

## Colunas obrigatorias

| Coluna | Exemplo | Observacao |
| --- | --- | --- |
| Empresa | Clinica XYZ | Nome comercial do lead |
| Cidade | Pouso Alegre | Usada para filtros e deduplicacao |
| Estado | MG | UF com duas letras |
| Categoria | Dentistas | Pode ser uma categoria ja existente ou nova |

## Colunas recomendadas

| Coluna | Exemplo |
| --- | --- |
| Telefone | 35999999999 |
| Instagram | https://instagram.com/empresa |
| Site | https://empresa.com.br |
| Google Maps | https://maps.google.com/... |
| Nota | 4.8 |
| Avaliacoes | 124 |
| Endereco | Rua A, 123 |
| Latitude | -22.22 |
| Longitude | -45.93 |

## Regras de qualidade

- Remova linhas vazias antes de importar.
- Use uma empresa por linha.
- Padronize telefones apenas com numeros quando possivel.
- Use `Sim` ou `Nao` para colunas booleanas, quando existirem.
- Evite abreviacoes diferentes para a mesma cidade.
- Revise duplicados antes da importacao.

## Deduplicacao

O Orbit Leads identifica duplicados usando:

- Empresa
- Telefone
- Cidade

Se o telefone estiver vazio, a empresa e a cidade passam a ser ainda mais importantes.

## Status inicial

Todo lead importado deve iniciar como `Novo`, salvo quando a planilha declarar um status valido:

- Novo
- Mensagem enviada
- Respondeu
- Interessado
- Reuniao
- Proposta
- Cliente
- Perdido

## Checklist antes de enviar a planilha

- Conferir cabecalhos das colunas.
- Validar se Cidade e Estado estao preenchidos.
- Conferir notas como numero de 0 a 5.
- Conferir avaliacoes como numero inteiro.
- Remover duplicados obvios.
- Salvar uma copia de seguranca do arquivo original.

## Proxima etapa tecnica

A pagina de importacao pode evoluir para upload com preview, validacao linha a linha, simulacao de duplicados e importacao em lote via fila.
