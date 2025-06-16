'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  content: string;
}

interface Option {
  text: string;
  value: string;
}

interface UserDetails {
  companyName: string;
  userName: string;
  phoneNumber: string;
}

interface InputField {
  name: keyof UserDetails;
  label: string;
  type: string;
  required: boolean;
}

interface Question {
  id: string;
  text: string;
  type?: 'input';
  options?: Option[];
  fields?: InputField[];
}

const questions: Question[] = [
  {
    id: 'initial',
    text: 'Would you like to trade in Recycled Plastic?',
    options: [
      { text: 'Yes, I want to trade', value: 'yes' },
      { text: 'Just exploring', value: 'explore' },
      { text: 'No, thanks', value: 'no' },
    ],
  },
  {
    id: 'userDetails',
    text: 'Please enter your details',
    type: 'input',
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'userName',    label: 'Your Name',     type: 'text', required: true },
      { name: 'phoneNumber', label: 'Phone Number',  type: 'tel',  required: true },
    ],
  },
  {
    id: 'confirm',
    text: 'Confirm submission?',
    options: [
      { text: 'Yes, proceed', value: 'confirm' },
      { text: 'No, go back',  value: 'back'    },
    ],
  },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', content: questions[0].text },
  ]);
  const [qIndex, setQIndex] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    companyName: '',
    userName: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // start open by default
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [messages]);

  const nextQuestion = () => {
    const next = qIndex + 1;
    if (next < questions.length) {
      setQIndex(next);
      setMessages(m => [...m, { type: 'bot', content: questions[next].text }]);
    }
  };

  const handleOption = async (opt: Option) => {
    const q = questions[qIndex];
    setMessages(m => [...m, { type: 'user', content: opt.text }]);

    if (q.id === 'initial' && opt.value === 'no') {
      setMessages(m => [...m, { type: 'bot', content: 'Thanks for stopping by!' }]);
      setIsComplete(true);
      return;
    }

    if (q.id === 'confirm') {
      if (opt.value === 'back') {
        setQIndex(1);
        setMessages(m => m.slice(0, -2));
        return;
      }

      // === direct POST to /chat-lead ===
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/chatlead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userDetails),
        });
        const result = await res.json();
        console.log(result);

        if (res.ok && result.success) {
          setMessages(m => [
            ...m,
            { 
              type: 'bot', 
              content: `✅ Alright! We'll contact you at ${userDetails.phoneNumber}.` 
            },
          ]);
        } else {
          setMessages(m => [
            ...m,
            { 
              type: 'bot', 
              content: `❌ Submission failed: ${result.error || result.message}` 
            },
          ]);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setMessages(m => [
          ...m,
          { type: 'bot', content: `❌ Submission error: ${errorMessage}` },
        ]);
      }
      setIsSubmitting(false);
      setIsComplete(true);
      return;
    }

    nextQuestion();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDetails = {
      companyName: formData.get('companyName') as string,
      userName: formData.get('userName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
    };
    setUserDetails(newDetails);
    setMessages(m => [
      ...m,
      {
        type: 'user',
        content: `Company: ${newDetails.companyName}\nName: ${newDetails.userName}\nPhone: ${newDetails.phoneNumber}`,
      },
    ]);
    nextQuestion();
  };

  const collapse = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMinimized(true);
      setIsClosing(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-green-700 to-green-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-transform hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div
          className={`
            flex flex-col w-80 h-96 bg-white rounded-3xl shadow-2xl overflow-hidden
            border border-gray-200 transition-all duration-500 ease-in-out
            ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-green-800 to-green-700">
            <h4 className="text-white font-semibold">Green Assistant</h4>
            <button onClick={collapse} className="text-white hover:opacity-80">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={msgRef}
            className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 text-sm leading-snug ${
                    m.type === 'user'
                      ? 'bg-green-700 text-white rounded-bl-3xl rounded-tl-3xl rounded-tr-xl'
                      : 'bg-white text-gray-800 rounded-tr-3xl rounded-br-3xl rounded-tl-xl shadow'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          {!isComplete && (
            <div className="p-4 bg-white border-t">
              {questions[qIndex].type === 'input' ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                  {questions[qIndex].fields?.map((field) => (
                    <div key={field.name}>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.label}
                        required={field.required}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  {questions[qIndex].options?.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOption(opt)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 