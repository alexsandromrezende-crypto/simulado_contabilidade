# Publicação corrigida — AVALIA 6

As 30 imagens foram incorporadas ao arquivo questions.js, sem alterar seu conteúdo visual, as alternativas ou o gabarito. A prova não depende mais da publicação da pasta assets para mostrar os enunciados. Os arquivos originais de imagem continuam incluídos para manutenção.

## GitHub e Vercel

1. Extraia o ZIP. Envie os arquivos extraídos ao repositório, mantendo index.html, questions.js, app.js, style.css e vercel.json na raiz. Não envie apenas o ZIP.
2. Substitua os arquivos antigos, principalmente questions.js. Confira se o GitHub mostra os arquivos extraídos.
3. Na Vercel, importe esse repositório. Use a raiz do repositório como Root Directory e o preset Other. Não é necessário comando de instalação ou de compilação; a saída é a própria raiz (.). O vercel.json incluído configura a saída estática.
4. Faça uma nova implantação após enviar as alterações. Abra o endereço dessa implantação e recarregue a página para receber os arquivos atualizados.

Se mantiver tudo dentro de uma subpasta do repositório, selecione essa subpasta como Root Directory na Vercel. Para GitHub Pages, publique a pasta que contém index.html.

Não foram alterados o código de acesso, as duas tentativas, o bloqueio de resposta confirmada ou o relatório. As tentativas continuam dependendo do navegador e do domínio: mudar de endereço não transporta os registros antigos.

---

# AVALIA 6.0 — offline, sem Node.js e sem banco de dados

Abra `index.html` no navegador depois de extrair todo o ZIP. O código comum é **AVALIA2026**.

## Fluxo
- 30 questões com as mesmas imagens e alternativas do material original.
- Após confirmação, as respostas são bloqueadas, e não é permitido retroceder pelo sistema.
- Relatório individual aberto em nova aba em PDF, com **somente duas colunas: Marcou e Resultado**. O número da questão aparece como parte do texto da coluna Marcou (por exemplo, `QUESTÃO 01 - B`). O relatório não exibe alternativa correta nem enunciados.
- Percentual menor que 50%: **ABAIXO DO BÁSICO**; de 50% a 70%, inclusive: **BÁSICO**; maior que 70%: **AVANÇADO**.
- Uma segunda tentativa pode ser iniciada pelo botão **Refazer prova**, após terminar a primeira. Máximo de duas tentativas **por matrícula e perfil/navegador**; a tentativa anterior fica registrada localmente. O estudante não consegue iniciar uma terceira tentativa pelo fluxo normal.

## Limitações de segurança
**NÃO É POSSÍVEL bloquear screenshots de verdade apenas com HTML/CSS/JS.** O sistema desativa seleção, menu de contexto, cópia, arraste e alguns atalhos durante a prova como *dissuasão*, mas não impede prints feitos pelo sistema operacional, fotografias ou inspeção dos arquivos locais. As imagens da prova precisam estar disponíveis ao navegador; portanto, estudantes com conhecimento técnico podem acessá-las.

O limite de duas tentativas e o gabarito também estão no computador do usuário (localStorage e `questions.js`). Eles podem ser alterados ou apagados pelo estudante, por outro perfil/navegador ou por outro dispositivo. Para controle confiável seria necessário autenticação e registro em servidor, mas esta versão respeita o requisito de ser totalmente offline.

## Teste rápido
Abra a página, informe identificação e código, confirme cada questão, confira a saída do PDF e clique em **Refazer prova**. Após a segunda tentativa, o botão desaparece. Ao limpar os dados do site, as tentativas locais também são apagadas.
