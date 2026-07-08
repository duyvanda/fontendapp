import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, TextInput, 
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import * as DocumentPicker from 'expo-document-picker';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { biraStyles } from './styles';
import { colors } from '@/styles/global';
import { useFeedback } from '@/context/FeedbackContext';
import { getBiraSessionId, saveBiraSessionId } from '@/storage/auth';
import { 
  loadMessages, saveMessages,
  ChatMessage, createUserMessage, createBotMessage 
} from '@/storage/chat';
import { BIRA_API_URL, MARKDOWN_CONVERT_URL } from '@/utils/api';
import { get_id } from '@/utils/string';

interface CloudAssistProps {
  visible: boolean;
  onClose: () => void;
}

export default function CloudAssist({ visible, onClose }: CloudAssistProps) {
  const { user_info, user_hr_info } = useFeedback();
  const manv = user_info?.manv || 'Unknown';
  
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const [attachedFiles, setAttachedFiles] = useState<{name: string, content: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<any>(null);
  
  const CameraComponent = VisionCamera as any;
  
  const flatListRef = useRef<FlatList>(null);

  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const isChatDisabled = userMessageCount >= 10 || messages.some(m => m.sender === 'bot' && m.text.includes("STOP AGENT"));

  // Init Session
  useEffect(() => {
    (async () => {
      if (visible && !sessionId) {
        let storedSession = await getBiraSessionId();
        if (!storedSession) {
          storedSession = get_id(); // Use generated ID as session fallback if needed
          await saveBiraSessionId(storedSession);
        }
        setSessionId(storedSession);
        const storedMsgs = await loadMessages(storedSession);
        if (storedMsgs.length > 0) {
          setMessages(storedMsgs);
        }
      }
    })();
  }, [visible, sessionId]);

  // Save Messages on change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveMessages(sessionId, messages);
    }
  }, [messages, sessionId]);

  const handleNewChat = async () => {
    if (!sessionId) return;
    const newSession = get_id();
    await saveBiraSessionId(newSession);
    setSessionId(newSession);
    setMessages([]);
    setInput('');
    setAttachedFiles([]);
  };

  const handlePickFile = async () => {
    if (isChatDisabled || isUploading || attachedFiles.length >= 2) return;
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/*'],
        multiple: false
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // Note: In RN, uploading file to API requires FormData with uri, type, name.
        // For simplicity in this port, we mock the behavior or you can implement actual fetch with FormData
        alert("File attach feature requires full backend integration. Appending dummy content for demo.");
        setAttachedFiles(prev => [...prev, { name: file.name, content: "Dummy extracted content" }]);
      }
    } catch (error) {
      console.error("Error picking file", error);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenCamera = async () => {
    if (isChatDisabled || isUploading || attachedFiles.length >= 2) return;
    
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        alert("Cần cấp quyền truy cập camera để chụp ảnh.");
        return;
      }
    }
    
    if (!device) {
      alert("Không tìm thấy camera trên thiết bị");
      return;
    }
    
    setShowCamera(true);
  };
  
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      setIsUploading(true);
      setShowCamera(false);
      try {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'speed'
        });
        if (photo) {
          setAttachedFiles(prev => [...prev, { name: `photo_${Date.now()}.jpg`, content: "Hình ảnh chụp từ Camera" }]);
        }
      } catch (e) {
        console.error("Camera error", e);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSend = async (suggestedText?: string) => {
    if (isChatDisabled || isThinking) return;
    
    const query = suggestedText || input;
    if (!query.trim() && attachedFiles.length === 0) return;

    let displayText = query.trim();
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(", ");
      if (!displayText) displayText = `📎 [Đã gửi tài liệu: ${fileNames}]`;
    }

    const userMsg = createUserMessage(displayText);
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Build payload
    const msgParts = [];
    if (query.trim()) msgParts.push(`[Câu hỏi của user]: ${query.trim()}`);
    else if (attachedFiles.length > 0) msgParts.push(`[Câu hỏi của user]: Đọc nội dung tài liệu.`);
    
    attachedFiles.forEach(f => {
      msgParts.push(`[Tài liệu đính kèm (${f.name})]: ${f.content}`);
    });

    const finalQuery = msgParts.join('\n');

    const payload = {
      appName: "bira_agent",
      userId: manv,
      sessionId,
      state: { ma_phan_quyen: manv },
      newMessage: { role: "user", parts: [{ text: finalQuery }] }
    };

    try {
      const response = await fetch(`${BIRA_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const events = await response.json();
      let botResponse = "Không tìm thấy phản hồi từ Agent.";
      
      if (Array.isArray(events)) {
        for (let i = events.length - 1; i >= 0; i--) {
          const event = events[i];
          if (event.content && event.author !== "user" && event.content.parts?.[0]?.text) {
            botResponse = event.content.parts[0].text;
            break;
          }
        }
      } else if (events.errorMessage) {
        botResponse = events.errorMessage;
      }

      setMessages(prev => [...prev, createBotMessage(botResponse)]);
    } catch (error: any) {
      setMessages(prev => [...prev, createBotMessage(`**Lỗi:** ${error.message || "Kết nối thất bại"}`, true)]);
    } finally {
      setIsThinking(false);
      setAttachedFiles([]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    const date = new Date(item.timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={[biraStyles.messageWrapper, isUser ? biraStyles.messageUser : biraStyles.messageBot]}>
        <View style={[biraStyles.bubble, isUser ? biraStyles.bubbleUser : biraStyles.bubbleBot]}>
          {isUser ? (
            <Text style={biraStyles.messageTextUser}>{item.text}</Text>
          ) : (
            <Markdown style={{ body: { color: colors.textPrimary, fontSize: 15 } }}>
              {item.text}
            </Markdown>
          )}
        </View>
        <Text style={[biraStyles.timestamp, isUser ? biraStyles.timestampUser : biraStyles.timestampBot]}>
          {isUser ? 'Bạn' : 'Bira'} • {timeStr}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={biraStyles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={biraStyles.modalContainer}>
          
          {/* Header */}
          <View style={biraStyles.header}>
            <View style={biraStyles.headerTitleContainer}>
              <View style={biraStyles.headerIcon}>
                <Ionicons name="chatbubbles" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={biraStyles.headerSubtitle}>Welcome to</Text>
                <Text style={biraStyles.headerTitle}>BIRA</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {messages.length > 0 && (
                <TouchableOpacity onPress={handleNewChat} style={{ marginRight: 16 }}>
                  <Ionicons name="refresh" size={24} color={colors.textCaption} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={biraStyles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              messages.length === 0 ? (
                <View>
                  <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 8 }}>
                    Hi, I'm <Text style={{ color: colors.primary, fontWeight: '700' }}>BIRA</Text> (BI Reporting Agent).
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>Chat với báo cáo của bạn.</Text>
                  
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.textCaption, marginBottom: 8 }}>TÔI SẼ GIÚP NHANH:</Text>
                  <View style={biraStyles.suggestionsContainer}>
                    {user_hr_info?.cloud_assist_questions?.map((q, idx) => (
                      <TouchableOpacity key={idx} style={biraStyles.suggestionChip} onPress={() => handleSend(q.question)}>
                        <Text style={biraStyles.suggestionText}>{q.question}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={
              isThinking ? (
                <View style={[biraStyles.messageWrapper, biraStyles.messageBot]}>
                  <View style={[biraStyles.bubble, biraStyles.bubbleBot, { flexDirection: 'row', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={biraStyles.messageTextBot}>Bira đang suy nghĩ...</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Attachments Preview */}
          {(attachedFiles.length > 0 || isUploading) && (
            <View style={biraStyles.attachmentsArea}>
              {attachedFiles.map((f, idx) => (
                <View key={idx} style={biraStyles.attachmentItem}>
                  <Ionicons name="document-attach" size={16} color={colors.textSecondary} />
                  <Text style={biraStyles.attachmentName} numberOfLines={1}>{f.name}</Text>
                  <TouchableOpacity onPress={() => removeFile(idx)}>
                    <Ionicons name="close-circle" size={18} color={colors.textCaption} />
                  </TouchableOpacity>
                </View>
              ))}
              {isUploading && (
                <View style={biraStyles.attachmentItem}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={biraStyles.attachmentName}>Đang xử lý file...</Text>
                </View>
              )}
            </View>
          )}

          {/* Input Area */}
          <View style={biraStyles.inputContainer}>
            <View style={biraStyles.inputWrapper}>
              <TouchableOpacity 
                style={biraStyles.attachButton} 
                onPress={handlePickFile}
                disabled={isChatDisabled || attachedFiles.length >= 2 || isThinking}
              >
                <Ionicons name="attach" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[biraStyles.attachButton, { marginLeft: -8 }]} 
                onPress={handleOpenCamera}
                disabled={isChatDisabled || attachedFiles.length >= 2 || isThinking}
              >
                <Ionicons name="camera" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TextInput
                style={biraStyles.textInput}
                placeholder={isChatDisabled ? "Vui lòng Reset để tiếp tục" : "Nhập câu hỏi..."}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                editable={!isChatDisabled && !isThinking}
              />

              <View style={[biraStyles.limitBadge, userMessageCount >= 10 ? biraStyles.limitBadgeDanger : userMessageCount >= 8 ? biraStyles.limitBadgeWarning : null]}>
                <Text style={[biraStyles.limitText, userMessageCount >= 10 && biraStyles.limitTextDanger]}>
                  {userMessageCount}/10
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[biraStyles.sendButton, (!input.trim() && attachedFiles.length === 0) || isChatDisabled || isThinking ? biraStyles.sendButtonDisabled : null]}
              onPress={() => handleSend()}
              disabled={(!input.trim() && attachedFiles.length === 0) || isChatDisabled || isThinking}
            >
              <Ionicons name="send" size={20} color={colors.textInverse} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>

      {/* Fullscreen Camera Overlay */}
      {showCamera && device && (
        <View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, { zIndex: 9999, backgroundColor: 'black' }]}>
          <CameraComponent 
            style={{ flex: 1 }} 
            device={device}
            isActive={true}
            photo={true}
            ref={cameraRef}
          />
          <View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', padding: 32, alignItems: 'center' }]}>
            <TouchableOpacity onPress={handleTakePicture} style={{
              width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', borderWidth: 4, borderColor: colors.primary
            }} />
            <TouchableOpacity onPress={() => setShowCamera(false)} style={{ position: 'absolute', top: 50, right: 20 }}>
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}
