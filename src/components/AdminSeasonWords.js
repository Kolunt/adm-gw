import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Input, Button, Table, Popconfirm, App, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;

const AdminSeasonWords = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [csvText, setCsvText] = useState('');

  const fetchWords = async () => {
    try {
      setLoading(true);
      const resp = await axios.get('/admin/season-words');
      setWords(resp.data || []);
    } catch (e) {
      message.error('Не удалось загрузить список слов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const addWord = async () => {
    const w = (newWord || '').trim();
    if (!w) return;
    try {
      setLoading(true);
      const resp = await axios.post('/admin/season-words', { words: [w] });
      if ((resp.data?.added || []).length > 0) {
        message.success('Слово добавлено');
        setNewWord('');
        fetchWords();
      } else {
        message.warning('Такое слово уже существует или пустое');
      }
    } catch (e) {
      message.error('Ошибка добавления слова');
    } finally {
      setLoading(false);
    }
  };

  const importCsv = async () => {
    const payload = (csvText || '').trim();
    if (!payload) return;
    try {
      setLoading(true);
      const resp = await axios.post('/admin/season-words/import', { csv: payload });
      const added = resp.data?.added || [];
      message.success(`Импортировано: ${added.length}`);
      setCsvText('');
      fetchWords();
    } catch (e) {
      message.error('Ошибка импорта CSV');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    // Экспорт только нормализованных слов (переработанный вид)
    const header = 'normalized\n';
    const rows = (words || []).map(w => {
      const norm = (w.normalized || '').replaceAll('"', '""');
      return `"${norm}"`;
    }).join('\n');
    const csv = header + rows + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'season_words.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteWord = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/admin/season-words/${id}`);
      message.success('Удалено');
      fetchWords();
    } catch (e) {
      message.error('Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Исходное', dataIndex: 'original', key: 'original' },
    { title: 'Нормализованное', dataIndex: 'normalized', key: 'normalized' },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, rec) => (
        <Popconfirm title="Удалить слово?" onConfirm={() => deleteWord(rec.id)}>
          <Button size="small" danger icon={<DeleteOutlined />}>Удалить</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Title level={3} style={{ margin: 0 }}>Слова для генерации токенов</Title>
          <Text type="secondary">Добавляйте "новогодние слова". Они будут нормализованы (нижний регистр, без знаков и пробелов) и использованы при генерации токенов.</Text>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Новое слово"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onPressEnter={addWord}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={addWord} loading={loading}>Добавить</Button>
              </Space.Compact>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ width: '100%' }}>
                <Input.TextArea
                  placeholder="CSV/строки: ёлка, снег; гирлянда\nподарок"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => { console.debug('Import click'); importCsv(); }}
                    loading={loading}
                    disabled={!csvText.trim()}
                  >
                    Импорт
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          <Button icon={<ReloadOutlined />} onClick={fetchWords} loading={loading}>
            Обновить список
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!words.length}>
            Экспорт CSV
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          dataSource={words}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AdminSeasonWords;


