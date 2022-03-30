import type { NextPage } from 'next';
import AuthForm from '../components/AuthForm';
import Header from '../components/Header';
import Layout from '../components/Layout';
import styles from '../styles/FindPassword.module.css';

const FindPassword: NextPage = () => {
  return (
    <Layout title="creddit: 비밀번호 찾기">
      <Header type="account" />
      <div className={styles.FindPasswordContainer}>
        <h1>비밀번호 찾기</h1>
        <div className={styles.FindPasswordText}>
          <p>이메일을 입력하고 확인 버튼을 누르시면, 해당 이메일로</p>
          <p>비밀번호 재설정 링크를 보내드립니다.</p>
        </div>
        <AuthForm type="findPassword" btnName="확인" />
      </div>
    </Layout>
  );
};

export default FindPassword;
