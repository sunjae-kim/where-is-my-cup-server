const bcrypt = require('bcrypt');

const { User, validateUser } = require('../../model/user');
const { utility: { signAccessToken, signRefreshToken } } = require('../../lib');

// POST /oauth/login
exports.login = async (req, res) => {
  // 사용자가 입력한 이메일이 데이터베이스에 존재하는지 확인한다.
  const { email, password } = req.body;
  const userExist = await User.findOne({ email, oauth: 'local' });
  if (!userExist) return res.status(400).send('존재하지 않는 이메일입니다.');

  // 사용자가 입력한 패스워드가 일치하는지 확인한다.
  const hash = userExist.password;
  const isAuthenticated = await bcrypt.compare(password, hash);
  if (!isAuthenticated) return res.status(400).send('비밀번호가 일치하지 않습니다.');

  // 토큰을 발행한다.
  const { _id, name } = userExist;
  const secret = req.app.get('jwt-secret');
  const accessToken = await signAccessToken({ _id, email, name }, secret);
  const refreshToken = await signRefreshToken({ _id, email, name }, secret);

  // 토큰을 헤더에 세팅하고 유저정보를 응답한다.
  res.set('x-access-token', accessToken);
  res.set('x-refresh-token', refreshToken);
  return res.status(200).send({ userExist });
};

// POST /oauth/register
exports.register = async (req, res) => {
  // 사용자의 인풋이 스키마에 부합하는지 확인한다.
  let user = req.body;
  const { error, value } = validateUser(user);
  if (error) return res.status(403).send('스키마에 부합하지 않습니다.');

  // 사용자의 이메일을 중복 확인한다.
  {
    const { email } = req.body;
    const userExist = await User.findOneByEmail(email);
    if (userExist) return res.status(400).send('이미 존재하는 이메일입니다.');
    user = { ...value, oauth: 'local' };
  }

  // 데이터 베이스에 사용자 정보를 등록한다.
  user = await User.create(user);

  // 토큰을 발행한다.
  const { _id, email, name } = user;
  const secret = req.app.get('jwt-secret');
  const accessToken = await signAccessToken({ _id, email, name }, secret);
  const refreshToken = await signRefreshToken({ _id, email, name }, secret);

  // 토큰을 헤더에 세팅하고 유저정보를 응답한다.
  res.set('x-access-token', accessToken);
  res.set('x-refresh-token', refreshToken);
  return res.status(201).send({ user });
};

// GET /oauth/access
exports.access = async (req, res) => {
  // 사용자가 보낸 토큰에서 payload 를 꺼낸다.
  const { tokenPayload: { email, name } } = req;
  const { tokenPayload: { _id } } = req;

  // 사용자에게 보낼 사용자 정보를 꺼낸다.
  const user = await User.findById(_id);
  if (!user) return res.status(400).send('존재하지 않는 사용자입니다.');

  // Access 토큰을 발행한다.
  const secret = req.app.get('jwt-secret');
  const accessToken = await signAccessToken({ email, _id, name }, secret);

  // 토큰을 헤더에 세팅하고 유저정보를 응답한다.
  res.set('x-access-token', accessToken);
  return res.status(200).send({ user });
};
