# Guia de Configuração Firebase na Netlify

Para que o CRM funcione corretamente após o deploy na Netlify, você deve configurar as variáveis de ambiente manualmente no painel administrativo deles.

## Passo a Passo

1.  **Acesse o painel da Netlify**: Entre em [app.netlify.com](https://app.netlify.com).
2.  **Selecione seu Site**: Clique no projeto do CRM que você subiu.
3.  **Configurações do Site**:
    *   No menu lateral, vá em **Site configuration**.
    *   Depois clique em **Environment variables**.
4.  **Adicionar Variáveis**: Clique em **Add a variable** > **Add single variable** e adicione as seguintes chaves (copie os valores do seu Firebase Console):

| Chave | Valor (Exemplo) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDaqcyzLDLjOgDd...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `seu-projeto` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `seu-projeto.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `77477390822` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:77477390822:web:070cf1...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-LGYM4H630E` |

5.  **Re-deploy**:
    *   As variáveis só são lidas durante o "Build". 
    *   Vá na aba **Deploys**.
    *   Clique no botão **Trigger deploy** e selecione **Clear cache and deploy site**.

## Por que isso é necessário?
Arquivos `.env.local` são ignorados pelo Git por segurança e não são enviados para a Netlify. Em produção, a Netlify injeta essas variáveis diretamente no processo de compilação do Next.js se elas estiverem configuradas no painel.

**Dúvidas?** Verifique o console do navegador no site publicado para ver o status da configuração (sem expor suas chaves).
