import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhnxbk6v_p5EJ_dgnh0oyCOcWD-AGnUUQ",
  authDomain: "ong-novo-amanha.firebaseapp.com",
  projectId: "ong-novo-amanha",
  storageBucket: "ong-novo-amanha.firebasestorage.app",
  messagingSenderId: "788965717185",
  appId: "1:788965717185:web:a2bdf9bcdafebe9abc9040"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Funções para manipular alunos
export async function getAlunos() {
  try {
    const alunosRef = collection(db, "alunos");
    const snapshot = await getDocs(alunosRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    throw error;
  }
}

export async function getAluno(id) {
  try {
    const alunoRef = doc(db, "alunos", id);
    const docSnap = await getDoc(alunoRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    throw error;
  }
}

export async function addAluno(alunoData) {
  try {
    const alunosRef = collection(db, "alunos");
    const docRef = await addDoc(alunosRef, {
      ...alunoData,
      status: "matriculado",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
    throw error;
  }
}

export async function updateAluno(id, alunoData) {
  try {
    const alunoRef = doc(db, "alunos", id);
    await updateDoc(alunoRef, {
      ...alunoData,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    throw error;
  }
}

export async function deleteAluno(id) {
  try {
    const alunoRef = doc(db, "alunos", id);
    await deleteDoc(alunoRef);
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    throw error;
  }
}

export async function getAlunosPorTurma(turmaId) {
  try {
    const alunosRef = collection(db, "alunos");
    const q = query(alunosRef, where("id_turma", "==", turmaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao buscar alunos por turma:", error);
    throw error;
  }
}

// Função para verificar autenticação
export function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}
