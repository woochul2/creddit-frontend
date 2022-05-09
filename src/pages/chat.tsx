import ChatListBox from 'components/ChatListBox';
import Layout from 'components/Layout';
import MessageBox from 'components/MessageBox';
import SendMessageDate from 'components/SendMessageDate';
import SendMessageForm from 'components/SendMessageForm';
import type { NextPage } from 'next';
import styles from 'styles/Chat.module.scss';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useCallback, useEffect, useState } from 'react';
import useUser from 'hooks/useUser';
import axios from 'axios';
import useInput from 'hooks/useInput';
import useModal from 'hooks/useModal';
import AddChatButton from 'components/AddChatButton';
import AddChatModal from 'components/AddChatModal';
import useSWR from 'swr';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

export type messageInfo = {
  message?: any;
  sender?: string;
  receiver: string;
  createdDate: string | number;
};

let client: any = null;
const socketUrl = 'http://localhost:8000/ws';

const Chat: NextPage = () => {
  const { user } = useUser();
  const username = user?.nickname;
  const [chat, onChangeChat, setChat] = useInput('');
  const { isModalOpen, openModal, closeModal } = useModal();
  const [currChatUser, setCurrChatUser] = useState('');
  const [chatDate, setChatDate] = useState(
    dayjs().format('YYYY년 MM월 DD일 dddd')
  );
  dayjs.locale('ko');

  const fetcher = (url: string) =>
    axios.get(url).then((response) => response.data);
  const fetcherDetails = (url: string) =>
    axios.get(url).then((response) => response.data.messages);

  const {
    data: chatData,
    //  mutate: mutateChat
  } = useSWR(`http://localhost:8000/chat/${username}/chatrooms`, fetcher);

  const { data: chatDetails } = useSWR(
    `http://localhost:8000/chat/${username}/chatrooms/${currChatUser}/messages`,
    fetcherDetails
  );

  // const { data: localUser } = useSWR(currChatUser, (key) => {
  //   localStorage.setItem('curUser', key);
  //   return localStorage.getItem('curUser');
  // });

  const getChatRooms = useCallback(() => {
    axios
      .get(`http://localhost:8000/chat/${username}/chatrooms`)
      .then((response) => {
        console.log('response: ', response.data);
      });
  }, [username]);

  useEffect(() => {
    getChatRooms();

    const socket = new SockJS(socketUrl);
    client = Stomp.over(socket);
    client.connect(
      {},
      () => {
        console.log('현재 ' + username);

        client.subscribe('/topic/' + username, function (msg: any) {
          _processMessage(msg.body), msg.headers.destination;
        });
        client.send('/topic/' + currChatUser, {}, JSON.stringify(chat));
      },
      (err: Error) => {
        console.log(err);
      }
    );
    setChatDate(dayjs().format('YYYY년 MM월 DD일 dddd'));
    return () => client.deactivate();
  }, [username, getChatRooms, chatData, chat, currChatUser, chatDetails]);

  const _processMessage = (msgBody: any) => {
    try {
      return JSON.parse(msgBody);
    } catch (e) {
      return msgBody;
    }
  };

  const publish = (messageInfo: messageInfo) => {
    if (!client.connected) {
      return;
    }

    client.publish({
      destination: '/app/send',
      body: JSON.stringify(messageInfo),
    });
  };

  const onSubmitForm = (e: any) => {
    e.preventDefault();
    setChat('');

    const messageInfo: messageInfo = {
      message: chat,
      sender: username,
      receiver: currChatUser,
      createdDate: dayjs().format('HH:MM'),
    };
    publish(messageInfo);
    console.log(messageInfo);
  };

  return (
    <Layout title="creddit: Chat">
      {user ? (
        <>
          <div className={styles.chatContainer}>
            <div className={styles.chatBox}>
              <AddChatButton onClick={openModal} />
              {chatData?.map((data: any, i: number) => (
                <ChatListBox
                  key={i}
                  interlocutorName={data.target}
                  onClick={() => {
                    setCurrChatUser(data.target);
                    console.log(currChatUser);
                    setChat('');
                  }}
                  // lastMessage={}
                  // sentDate={}
                />
              ))}
            </div>
            <div className={styles.messageform}>
              <div className={styles.messageBox}>
                {currChatUser && <SendMessageDate date={chatDate} />}

                {currChatUser &&
                  chatDetails?.map((data: any, i: number) => (
                    <MessageBox
                      key={i}
                      interlocutorName={data.sender}
                      content={data.message}
                      time={data.createdDate}
                      isMe={data.receiver === currChatUser ? true : false}
                    />
                  ))}
              </div>
              <div className={styles.SendMessageBox}>
                <SendMessageForm
                  onSubmit={onSubmitForm}
                  onChange={onChangeChat}
                  value={chat}
                />
              </div>
            </div>
            <AddChatModal show={isModalOpen} onCloseModal={closeModal} />
          </div>
        </>
      ) : (
        <div>로그인해주세요</div>
      )}
    </Layout>
  );
};

export default Chat;
