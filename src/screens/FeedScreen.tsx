import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { mockPosts, Post } from '../utils/mockData';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Card from '../components/cards/Card';
import { analyticsService } from '../utils/analytics';

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadPosts = () => {
    // Simulate API call with delay
    setLoading(true);
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = () => {
    // Simulate pull-to-refresh
    setRefreshing(true);
    setTimeout(() => {
      // Shuffle the posts to simulate new content
      const shuffled = [...mockPosts].sort(() => 0.5 - Math.random());
      setPosts(shuffled);
      setRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    loadPosts();
    analyticsService.trackScreenView('Feed');
  }, []);

  const renderPost = ({ item }: { item: Post }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <Card
        style={styles.card}
        onPress={() => {
          // Handle post tap
          analyticsService.trackEvent('post_tap', { post_id: item.id });
        }}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.author.avatarUrl }} style={styles.avatar} />
          <View style={styles.authorContainer}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.postDate}>{formattedDate}</Text>
          </View>
        </View>

        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postBody} numberOfLines={3}>
            {item.body}
          </Text>
        </View>

        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => {
              // Track Like event
              analyticsService.trackEvent('post_like', { post_id: item.id });
            }}>
            <Text style={styles.footerText}>❤️ {item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => {
              // Track Comment event
              analyticsService.trackEvent('post_comment', { post_id: item.id });
            }}>
            <Text style={styles.footerText}>💬 {item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => {
              // Track Share event
              analyticsService.trackEvent('post_share', { post_id: item.id });
            }}>
            <Text style={styles.footerText}>🔄 Share</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Feed F</Text>
            <Text style={styles.headerSubtitle}>
              Stay updated with the latest posts
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.gray,
  },
  flatListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginVertical: spacing.sm,
  },
  header: {
    marginVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.dark,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorContainer: {
    marginLeft: spacing.sm,
  },
  authorName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold as any,
    color: colors.dark,
  },
  postDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray,
  },
  postImage: {
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  postContent: {
    marginBottom: spacing.md,
  },
  postTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semiBold as any,
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  postBody: {
    fontSize: typography.fontSizes.md,
    color: colors.grayDark,
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: spacing.sm,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default FeedScreen;
