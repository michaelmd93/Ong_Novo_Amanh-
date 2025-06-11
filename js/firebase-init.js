// Firebase SDK - Inserir dados simulados (após inicializar o Firebase no seu projeto)
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// Configuração real do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBIG-2A1Bjog0XlS2BDIa1hd-PlrY7W0v4",
  authDomain: "sistema-ong-c6c05.firebaseapp.com",
  projectId: "sistema-ong-c6c05",
  storageBucket: "sistema-ong-c6c05.firebasestorage.app",
  messagingSenderId: "326382290585",
  appId: "1:326382290585:web:ee0f282efe6f0e303d5a08"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inserir dados simulados
async function popularFirestore() {
  try {
    // Usuários
    await setDoc(doc(db, "usuarios", "usuario_001"), {
      nome: "Ana Souza",
      email: "ana@betaong.org",
      perfil: "ADM",
      avatar: "padrao1.png"
    });

    await setDoc(doc(db, "usuarios", "usuario_002"), {
      nome: "Carlos Menezes",
      email: "carlos@betaong.org",
      perfil: "Professor",
      avatar: "padrao2.png"
    });

    // Turmas
    await setDoc(doc(db, "turmas", "turma_001"), {
      nome_turma: "Turma A"
    });

    await setDoc(doc(db, "turmas", "turma_002"), {
      nome_turma: "Turma B"
    });

    // Alunos
    await setDoc(doc(db, "alunos", "aluno_001"), {
      nome: "João Silva",
      data_nasc: "2012-04-01",
      status: "matriculado",
      id_turma: "turma_001",
      id_usuario: "usuario_001"
    });

    // Chamadas
    await setDoc(doc(db, "chamadas", "chamada_001"), {
      id_turma: "turma_001",
      id_aluno: "aluno_001",
      data: "2025-06-10",
      presente: true
    });

    console.log("📥 Dados simulados inseridos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
  }
}

// Executar a função de popular o banco
popularFirestore();
