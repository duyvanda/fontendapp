import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, TextInput, 
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
  StyleSheet
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Markdown from 'react-native-markdown-display';
import { useFeedback } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { getBiraSessionId, saveBiraSessionId } from '@/storage/auth';
import { 
  loadMessages, saveMessages,
  ChatMessage, createUserMessage, createBotMessage 
} from '@/storage/chat';
import { BIRA_API_URL, MARKDOWN_CONVERT_URL } from '@/utils/api';
import { 
  get_id, 
  generate_month_options, 
  inserted_at, 
  remove_accents_with_case, 
  format_date_ymd 
} from '@/utils/string';
import { colors } from '@/styles/global';
import { biraStyles } from './styles';

interface CloudAssistProps {
  visible: boolean;
  onClose: () => void;
}

export default function CloudAssist({ visible, onClose }: CloudAssistProps) {
  const {
    user_info,
    user_hr_info,
    login_text,
    login_loading,
    reports,
    filter_reports,
    report_id,
    report_param,
    shared,
    loading,
    rp_screen,
    login_user,
    logout_user,
    fetch_reports,
    fetch_filter_reports,
    fetch_filter_reports_rt,
    clear_filter_report,
    user_logger,
    set_rp_screen,
  } = useFeedback();

  const manv = user_info?.manv || 'Unknown';
  
  const [session_id, set_session_id] = useState<string>('');
  const [messages, set_messages] = useState<ChatMessage[]>([]);
  const [input, set_input] = useState('');
  const [is_thinking, set_is_thinking] = useState(false);
  
  const [attached_files, set_attached_files] = useState<{name: string, content: string}[]>([]);
  const [is_uploading, set_is_uploading] = useState(false);
  const { hasPermission: has_permission, requestPermission: request_permission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [show_camera, set_show_camera] = useState(false);
  const camera_ref = useRef<any>(null);
  
  const CameraComponent = VisionCamera as any;
  
  const flat_list_ref = useRef<FlatList>(null);

  const user_message_count = messages.filter(m => m.sender === 'user').length;
  const is_chat_disabled = user_message_count >= 10 || messages.some(m => m.sender === 'bot' && m.text.includes("STOP AGENT"));

  // Init Session
  useEffect(() => {
    (async () => {
      if (visible && !session_id) {
        let stored_session = await getBiraSessionId();
        if (!stored_session) {
          stored_session = get_id(); // Use generated ID as session fallback if needed
          await saveBiraSessionId(stored_session);
        }
        set_session_id(stored_session);
        const stored_msgs = await loadMessages(stored_session);
        if (stored_msgs.length > 0) {
          set_messages(stored_msgs);
        }
      }
    })();
  }, [visible, session_id]);

  // Save Messages on change
  useEffect(() => {
    if (session_id && messages.length > 0) {
      saveMessages(session_id, messages);
    }
  }, [messages, session_id]);

  const handle_new_chat = async () => {
    if (!session_id) return;
    const new_session = get_id();
    await saveBiraSessionId(new_session);
    set_session_id(new_session);
    set_messages([]);
    set_input('');
    set_attached_files([]);
  };

  const handle_pick_file = async () => {
    if (is_chat_disabled || is_uploading || attached_files.length >= 2) return;
    
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
        set_attached_files(prev => [...prev, { name: file.name, content: "Dummy extracted content" }]);
      }
    } catch (error) {
      console.error("Error picking file", error);
    }
  };

  const remove_file = (index: number) => {
    set_attached_files(prev => prev.filter((_, i) => i !== index));
  };

  const handle_open_camera = async () => {
    if (is_chat_disabled || is_uploading || attached_files.length >= 2) return;
    
    if (!has_permission) {
      const granted = await request_permission();
      if (!granted) {
        alert("Cần cấp quyền truy cập camera để chụp ảnh.");
        return;
      }
    }
    
    if (!device) {
      alert("Không tìm thấy camera trên thiết bị");
      return;
    }
    
    set_show_camera(true);
  };
  
  const handle_take_picture = async () => {
    if (camera_ref.current) {
      set_is_uploading(true);
      set_show_camera(false);
      try {
        const photo = await camera_ref.current.takePhoto({
          qualityPrioritization: 'speed'
        });
        if (photo) {
          set_attached_files(prev => [...prev, { name: `photo_${Date.now()}.jpg`, content: "Hình ảnh chụp từ Camera" }]);
        }
      } catch (e) {
        console.error("Camera error", e);
      } finally {
        set_is_uploading(false);
      }
    }
  };

  const handle_send = async (suggested_text?: string) => {
    if (is_chat_disabled || is_thinking) return;
    
    const query = suggested_text || input;
    if (!query.trim() && attached_files.length === 0) return;

    let display_text = query.trim();
    if (attached_files.length > 0) {
      const file_names = attached_files.map(f => f.name).join(", ");
      if (!display_text) display_text = `📎 [Đã gửi tài liệu: ${file_names}]`;
    }

    const user_msg = createUserMessage(display_text);
    set_messages(prev => [...prev, user_msg]);
    set_input('');
    set_is_thinking(true);

    // Build payload
    const msg_parts = [];
    if (query.trim()) msg_parts.push(`[Câu hỏi của user]: ${query.trim()}`);
    else if (attached_files.length > 0) msg_parts.push(`[Câu hỏi của user]: Đọc nội dung tài liệu.`);
    
    attached_files.forEach(f => {
      msg_parts.push(`[Tài liệu đính kèm (${f.name})]: ${f.content}`);
    });

    const final_query = msg_parts.join('\n');

    const payload = {
      appName: "bira_agent",
      userId: manv,
      sessionId: session_id,
      state: { ma_phan_quyen: manv },
      newMessage: { role: "user", parts: [{ text: final_query }] }
    };

    try {
      const response = await fetch(`${BIRA_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const events = await response.json();
      let bot_response = "Không tìm thấy phản hồi từ Agent.";
      
      if (Array.isArray(events)) {
        for (let i = events.length - 1; i >= 0; i--) {
          const event = events[i];
          if (event.content && event.author !== "user" && event.content.parts?.[0]?.text) {
            bot_response = event.content.parts[0].text;
            break;
          }
        }
      } else if (events.errorMessage) {
        bot_response = events.errorMessage;
      }

      set_messages(prev => [...prev, createBotMessage(bot_response)]);
    } catch (error: any) {
      set_messages(prev => [...prev, createBotMessage(`**Lỗi:** ${error.message || "Kết nối thất bại"}`, true)]);
    } finally {
      set_is_thinking(false);
      set_attached_files([]);
      setTimeout(() => flat_list_ref.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const render_message = ({ item }: { item: ChatMessage }) => {
    const is_user = item.sender === 'user';
    const date = new Date(item.timestamp);
    const time_str = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={[biraStyles.messageWrapper, is_user ? biraStyles.messageUser : biraStyles.messageBot]}>
        <View style={[biraStyles.bubble, is_user ? biraStyles.bubbleUser : biraStyles.bubbleBot]}>
          {is_user ? (
            <Text style={biraStyles.messageTextUser}>{item.text}</Text>
          ) : (
            <Markdown style={{ body: { color: colors.textPrimary, fontSize: 15 } }}>
              {item.text}
            </Markdown>
          )}
        </View>
        <Text style={[biraStyles.timestamp, is_user ? biraStyles.timestampUser : biraStyles.timestampBot]}>
          {is_user ? 'Bạn' : 'Bira'} • {time_str}
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
                <TouchableOpacity onPress={handle_new_chat} style={{ marginRight: 16 }}>
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
            ref={flat_list_ref}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={render_message}
            contentContainerStyle={biraStyles.messagesList}
            onContentSizeChange={() => flat_list_ref.current?.scrollToEnd({ animated: true })}
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
                      <TouchableOpacity key={idx} style={biraStyles.suggestionChip} onPress={() => handle_send(q.question)}>
                        <Text style={biraStyles.suggestionText}>{q.question}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={
              is_thinking ? (
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
          {(attached_files.length > 0 || is_uploading) && (
            <View style={biraStyles.attachmentsArea}>
              {attached_files.map((f, idx) => (
                <View key={idx} style={biraStyles.attachmentItem}>
                  <Ionicons name="document-attach" size={16} color={colors.textSecondary} />
                  <Text style={biraStyles.attachmentName} numberOfLines={1}>{f.name}</Text>
                  <TouchableOpacity onPress={() => remove_file(idx)}>
                    <Ionicons name="close-circle" size={18} color={colors.textCaption} />
                  </TouchableOpacity>
                </View>
              ))}
              {is_uploading && (
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
                onPress={handle_pick_file}
                disabled={is_chat_disabled || attached_files.length >= 2 || is_thinking}
              >
                <Ionicons name="attach" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[biraStyles.attachButton, { marginLeft: -8 }]} 
                onPress={handle_open_camera}
                disabled={is_chat_disabled || attached_files.length >= 2 || is_thinking}
              >
                <Ionicons name="camera" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TextInput
                style={biraStyles.textInput}
                placeholder={is_chat_disabled ? "Vui lòng Reset để tiếp tục" : "Nhập câu hỏi..."}
                value={input}
                onChangeText={set_input}
                multiline
                maxLength={500}
                editable={!is_chat_disabled && !is_thinking}
              />

              <View style={[biraStyles.limitBadge, user_message_count >= 10 ? biraStyles.limitBadgeDanger : user_message_count >= 8 ? biraStyles.limitBadgeWarning : null]}>
                <Text style={[biraStyles.limitText, user_message_count >= 10 && biraStyles.limitTextDanger]}>
                  {user_message_count}/10
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[biraStyles.sendButton, (!input.trim() && attached_files.length === 0) || is_chat_disabled || is_thinking ? biraStyles.sendButtonDisabled : null]}
              onPress={() => handle_send()}
              disabled={(!input.trim() && attached_files.length === 0) || is_chat_disabled || is_thinking}
            >
              <Ionicons name="send" size={20} color={colors.textInverse} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          
        </View>
      </KeyboardAvoidingView>

      {/* Fullscreen Camera Overlay */}
      {show_camera && device && (
        <View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, { zIndex: 9999, backgroundColor: 'black' }]}>
          <CameraComponent 
            style={{ flex: 1 }} 
            device={device}
            isActive={true}
            photo={true}
            ref={camera_ref}
          />
          <View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', padding: 32, alignItems: 'center' }]}>
            <TouchableOpacity onPress={handle_take_picture} style={{
              width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', borderWidth: 4, borderColor: colors.primary
            }} />
            <TouchableOpacity onPress={() => set_show_camera(false)} style={{ position: 'absolute', top: 50, right: 20 }}>
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}
