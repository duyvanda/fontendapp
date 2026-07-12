import { useFeedback } from '@/context/FeedbackContext';
import { get_bira_session_id, save_bira_session_id } from '@/storage/auth';
import {
  chat_message_type,
  create_bot_message,
  create_user_message,
  load_messages, save_messages
} from '@/storage/chat';
import { colors } from '@/styles/global';
import { BIRA_API_URL, MARKDOWN_CONVERT_URL } from '@/utils/api';
import {
  get_id
} from '@/utils/string';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import { biraStyles } from './styles';

export default function CloudAssist() {
  const insets = useSafeAreaInsets();
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
  const [messages, set_messages] = useState<chat_message_type[]>([]);
  const [input, set_input] = useState('');
  const [is_thinking, set_is_thinking] = useState(false);

  const [attached_files, set_attached_files] = useState<{ name: string, content: string }[]>([]);
  const [is_uploading, set_is_uploading] = useState(false);
  const [preview_file, set_preview_file] = useState<{ name: string, content: string } | null>(null);
  const { hasPermission: has_permission, requestPermission: request_permission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [show_camera, set_show_camera] = useState(false);
  const camera_ref = useRef<any>(null);
  const photoOutput = usePhotoOutput();

  const CameraComponent = VisionCamera as any;

  const segments = useSegments();
  const isFocused = segments[1] === 'bira';
  const flat_list_ref = useRef<FlatList>(null);

  // Auto-scroll khi có tin nhắn mới hoặc bot đang typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      flat_list_ref.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timeout);
  }, [messages, is_thinking]);

  const user_message_count = messages.filter(m => m.sender === 'user').length;
  const is_chat_disabled = user_message_count >= 10 || messages.some(m => m.sender === 'bot' && m.text.includes("STOP AGENT"));

  // Init Session
  useEffect(() => {
    (async () => {
      if (!session_id) {
        let stored_session = await get_bira_session_id();
        if (!stored_session) {
          stored_session = get_id(); // Use generated ID as session fallback if needed
          await save_bira_session_id(stored_session);
        }
        set_session_id(stored_session);
        const stored_msgs = await load_messages(stored_session);
        if (stored_msgs.length > 0) {
          set_messages(stored_msgs);
        }
      }
    })();
  }, [session_id]);

  // Save Messages on change
  useEffect(() => {
    if (session_id && messages.length > 0) {
      save_messages(session_id, messages);
    }
  }, [messages, session_id]);

  const handle_new_chat = async () => {
    if (!session_id) return;
    const new_session = get_id();
    await save_bira_session_id(new_session);
    set_session_id(new_session);
    set_messages([]);
    set_input('');
    set_attached_files([]);
  };

  const handle_pick_file = async () => {
    if (is_chat_disabled || is_uploading || attached_files.length >= 2) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*',
          'text/plain',
        ],
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const filename_lower = file.name.toLowerCase();
        const is_excel_or_pdf = filename_lower.endsWith('.xlsx') || filename_lower.endsWith('.xls') || filename_lower.endsWith('.pdf');
        const MAX_SIZE = is_excel_or_pdf ? 500 * 1024 : 5 * 1024 * 1024;
        const size_label = is_excel_or_pdf ? '500KB' : '5MB';

        if (file.size && file.size > MAX_SIZE) {
          Alert.alert('File quá lớn', `"${file.name}" vượt quá giới hạn ${size_label}`);
          return;
        }
        if (attached_files.some(f => f.name === file.name)) {
          Alert.alert('Trùng file', `"${file.name}" đã được đính kèm trước đó.`);
          return;
        }

        set_is_uploading(true);
        try {
          const form_data = new FormData();
          form_data.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name,
          } as any);

          const data = await new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', MARKDOWN_CONVERT_URL);
            xhr.onreadystatechange = () => {
              if (xhr.readyState !== 4) return;
              if (xhr.status === 413) {
                reject(new Error(`File "${file.name}" vượt quá giới hạn dung lượng Server.`));
              } else if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText)); }
                catch { reject(new Error('Phản hồi không hợp lệ từ server')); }
              } else {
                try {
                  const err = JSON.parse(xhr.responseText);
                  reject(new Error(err.detail || `HTTP ${xhr.status}`));
                } catch { reject(new Error(`HTTP ${xhr.status}`)); }
              }
            };
            xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
            xhr.send(form_data);
          });

          set_attached_files(prev => [...prev, { name: file.name, content: data.content }]);
        } catch (err: any) {
          Alert.alert('Lỗi', `Không thể xử lý file "${file.name}": ${err.message}`);
        } finally {
          set_is_uploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking file', error);
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
    try {
      set_is_uploading(true);
      const photo = await photoOutput.capturePhotoToFile({ flashMode: 'off' }, {});
      set_show_camera(false);
      if (!photo?.filePath) return;

      const photo_name = `photo_${Date.now()}.jpg`;
      const photo_uri = `file://${photo.filePath}`;

      const form_data = new FormData();
      form_data.append('file', {
        uri: photo_uri,
        type: 'image/jpeg',
        name: photo_name,
      } as any);

      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', MARKDOWN_CONVERT_URL);
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error('Phản hồi không hợp lệ')); }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
        xhr.send(form_data);
      });

      set_attached_files(prev => [...prev, { name: photo_name, content: data.content }]);
    } catch (e: any) {
      console.error('Camera error', e);
      Alert.alert('Lỗi', `Không thể xử lý ảnh: ${e.message}`);
    } finally {
      set_is_uploading(false);
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

    const user_msg = create_user_message(display_text);
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

      set_messages(prev => [...prev, create_bot_message(bot_response)]);
    } catch (error: any) {
      set_messages(prev => [...prev, create_bot_message(`**Lỗi:** ${error.message || "Kết nối thất bại"}`, true)]);
    } finally {
      set_is_thinking(false);
      set_attached_files([]);
      setTimeout(() => flat_list_ref.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const render_message = ({ item }: { item: chat_message_type }) => {
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
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: colors.surface }}>

          {/* Header */}
          {isFocused && <StatusBar style="dark" />}
          <View style={[biraStyles.header, { paddingTop: insets.top + 8 }]}>
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
                <TouchableOpacity
                  onPress={handle_new_chat}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primarySubtle,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>Chat mới</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flat_list_ref}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={render_message}
            contentContainerStyle={biraStyles.messagesList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flat_list_ref.current?.scrollToEnd({ animated: false })}
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
                  <TouchableOpacity onPress={() => set_preview_file(f)} style={{ flex: 1, paddingHorizontal: 4 }}>
                    <Text style={[biraStyles.attachmentName, { color: colors.primary, textDecorationLine: 'underline' }]} numberOfLines={1}>{f.name}</Text>
                  </TouchableOpacity>
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
          <View style={[biraStyles.inputContainer, is_chat_disabled && { flexDirection: 'column', alignItems: 'stretch' }]}>
            {is_chat_disabled ? (
              <View style={{ width: '100%' }}>
                {/* Red Warning Banner */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 71, 87, 0.08)',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 71, 87, 0.2)'
                }}>
                  <Ionicons name="alert-circle" size={20} color="#ff4757" style={{ marginRight: 8 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#ff4757', fontWeight: '600', lineHeight: 18 }}>
                    Đã đạt giới hạn 10/10 câu hỏi hoặc cuộc hội thoại đã kết thúc. Vui lòng bắt đầu cuộc chat mới để tiếp tục.
                  </Text>
                </View>

                {/* Big reset button */}
                <TouchableOpacity
                  onPress={handle_new_chat}
                  style={{
                    height: 48,
                    backgroundColor: colors.primary,
                    borderRadius: 24, // pill shape
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4, // Android shadow
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-circle" size={22} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700' }}>Bắt đầu phiên chat mới</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
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
                    placeholder="Nhập câu hỏi..."
                    value={input}
                    onChangeText={set_input}
                    multiline
                    maxLength={500}
                    editable={!is_thinking}
                  />

                  <View style={[biraStyles.limitBadge, user_message_count >= 8 ? biraStyles.limitBadgeWarning : null]}>
                    <Text style={biraStyles.limitText}>
                      {user_message_count}/10
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[biraStyles.sendButton, (!input.trim() && attached_files.length === 0) || is_thinking ? biraStyles.sendButtonDisabled : null]}
                  onPress={() => handle_send()}
                  disabled={(!input.trim() && attached_files.length === 0) || is_thinking}
                >
                  <Ionicons name="send" size={20} color={colors.textInverse} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={{ textAlign: 'center', fontSize: 10, color: colors.textCaption, marginTop: 4, marginBottom: 8, paddingHorizontal: 16 }}>
            BIRA là AI và có thể mắc lỗi. Vui lòng kiểm tra lại các thông tin quan trọng.
          </Text>

        </View>
      </KeyboardAvoidingView>

      {/* Fullscreen Camera Overlay */}
      {show_camera && device && (
        <View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, { zIndex: 9999, backgroundColor: 'black' }]}>
          <CameraComponent
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            outputs={[photoOutput]}
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
      {/* File Preview Modal */}
      <Modal
        visible={preview_file !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => set_preview_file(null)}
        statusBarTranslucent={true}
      >
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: insets.top }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
            <Ionicons name="document-text" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
              Nội dung file: {preview_file?.name}
            </Text>
            <TouchableOpacity onPress={() => set_preview_file(null)} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {preview_file?.content ? (
              <Markdown style={{ body: { color: colors.textPrimary, fontSize: 15 } }}>
                {preview_file.content}
              </Markdown>
            ) : (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>Không có nội dung text nào.</Text>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
