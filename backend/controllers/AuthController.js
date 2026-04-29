import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Morador from '../models/Morador.js';

class AuthController {
  async login(req, res) {
    const { email, senha } = req.body;

    try {
      console.log(`Tentativa de login: ${email}`);
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        console.warn(`Login falhou: Usuário ${email} não encontrado.`);
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        console.warn(`Login falhou: Senha incorreta para ${email}.`);
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      console.log(`Login bem-sucedido: ${email} (${usuario.perfil})`);
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      return res.json({
        user: {
          id: usuario.id,
          email: usuario.email,
          perfil: usuario.perfil
        },
        token
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro no servidor' });
    }
  }

  async me(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.user.id, {
        include: [{ model: Morador }]
      });
      return res.json(usuario);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }
}

export default new AuthController();
