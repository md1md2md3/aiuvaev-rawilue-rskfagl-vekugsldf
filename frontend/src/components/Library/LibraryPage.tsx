import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Skeleton,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search,
  Download,
  Chat,
  Quiz,
  Clear,
  FilterList,
  LibraryBooks,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { PDF, PDFsResponse } from '../../types';
import { usePDF } from '../../contexts/PDFContext';

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentPDF } = usePDF();
  
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageSize = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      fetchPDFs();
    }
  }, [selectedCategory, currentPage, searchQuery]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(['Tous', ...categoriesData]);
      setSelectedCategory('Tous');
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
    }
  };

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const response: PDFsResponse = await apiService.getPDFs(
        selectedCategory === 'Tous' ? '' : selectedCategory,
        currentPage - 1,
        pageSize
      );
      setPdfs(response.pdfs);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPDFs();
      return;
    }

    setLoading(true);
    try {
      const category = selectedCategory === 'Tous' ? '' : selectedCategory;
      const response = await apiService.searchPDFs(searchQuery, category, currentPage - 1, pageSize);
      setPdfs(response.pdfs);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchPDFs();
  };

  const handleOpenPDF = (pdf: PDF, mode: 'chat' | 'quiz') => {
    setCurrentPDF(pdf);
    navigate(`/pdf/${pdf.id}/${mode}`);
  };

  const handleDownload = (downloadLink: string, title: string) => {
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Bibliothèque</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Bibliothèque de ressources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explorez et étudiez notre collection de documents pédagogiques
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Catégorie"
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Rechercher
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Chargement...' : `${pdfs.length} document(s) trouvé(s)`}
        </Typography>
        <Chip
          icon={<LibraryBooks />}
          label={selectedCategory}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* PDF Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Skeleton loading
          Array.from({ length: pageSize }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton height={60} />
                  <Skeleton height={20} sx={{ mt: 2 }} />
                  <Skeleton height={20} />
                </CardContent>
                <CardActions>
                  <Skeleton width={80} height={36} />
                  <Skeleton width={80} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          pdfs.map((pdf) => (
            <Grid item xs={12} sm={6} md={4} key={pdf.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {pdf.title.replace(/\n/g, ' ').trim()}
                  </Typography>
                  
                  <Chip
                    label={pdf.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    Créé le {new Date(pdf.createdAt).toLocaleDateString('fr-FR')}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Chat />}
                    onClick={() => handleOpenPDF(pdf, 'chat')}
                    sx={{ textTransform: 'none' }}
                  >
                    Discuter
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Quiz />}
                    onClick={() => handleOpenPDF(pdf, 'quiz')}
                    sx={{ textTransform: 'none' }}
                  >
                    Quiz
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(pdf.downloadLink, pdf.title)}
                    sx={{ ml: 'auto' }}
                  >
                    <Download />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* No Results */}
      {!loading && pdfs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LibraryBooks sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun document trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Essayez de modifier vos critères de recherche
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default LibraryPage;