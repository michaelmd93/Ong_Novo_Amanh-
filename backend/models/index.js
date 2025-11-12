const sequelize = require('../config/database');
const UserModel = require('./User');
const AlunoModel = require('./Aluno');
const ProfessorModel = require('./Professor');
const CursoModel = require('./Curso');

// Inicializar modelos
const User = UserModel(sequelize);
const Aluno = AlunoModel(sequelize);
const Professor = ProfessorModel(sequelize);
const Curso = CursoModel(sequelize);

// Definir associações

// User -> Alunos
User.hasMany(Aluno, {
  foreignKey: 'usuario_id',
  as: 'alunos_cadastrados'
});

Aluno.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// User -> Professores
User.hasMany(Professor, {
  foreignKey: 'usuario_id',
  as: 'professores_cadastrados'
});

Professor.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// User -> Cursos
User.hasMany(Curso, {
  foreignKey: 'usuario_id',
  as: 'cursos_cadastrados'
});

Curso.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// Professor -> Cursos
Professor.hasMany(Curso, {
  foreignKey: 'professor_id',
  as: 'cursos_ministrados'
});

Curso.belongsTo(Professor, {
  foreignKey: 'professor_id',
  as: 'professor'
});

// Exportar modelos e conexão
module.exports = {
  sequelize,
  User,
  Aluno,
  Professor,
  Curso
};
