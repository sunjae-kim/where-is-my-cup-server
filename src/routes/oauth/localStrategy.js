const bcrypt = require('bcrypt');

const { Users, validateUser } = require('../../model/users');
const { signAccessToken, signRefreshToken } = require('../../lib');

exports.login = async (req, res) => {
  // TODO: Implement
  const { password } = req.body;
  const hash = '$2b$10$SjHz/MZHy0dGBIq2mUVzYOasnDqVIUc05T6dMDjQTPOjin75qMby6'; // 12345
  const isAuthenticated = await bcrypt.compare(password, hash);
  res.status(200).send(isAuthenticated);
};

exports.register = async (req, res) => {
  // 사용자의 인풋이 스키마에 부합하는지 확인한다.
  let user = req.body;
  const { error, value } = validateUser(user);
  if (error) return res.status(403).send('스키마에 부합하지 않습니다.');

  // 사용자의 이메일을 중복 확인한다.
  {
    const { email } = req.body;
    const userExist = await Users.findOneByEmail(email);
    if (userExist) return res.status(400).send('이미 존재하는 이메일 입니다.');
    user = { ...value, oauth: 'local' };
  }

  // 데이터 베이스에 사용자 정보를 등록한다.
  user = await Users.create(user);

  // 토큰을 발행한다.
  const { _id, email } = user;
  const secret = req.app.get('jwt-secret');
  const accessToken = await signAccessToken({ _id, email }, secret);
  const refreshToken = await signRefreshToken({ _id, email }, secret);

  // 토큰을 헤더에 세팅하고 유저정보를 응답한다.
  res.set('x-access-token', accessToken);
  res.set('x-refresh-token', refreshToken);
  return res.status(200).send({ user });
};
