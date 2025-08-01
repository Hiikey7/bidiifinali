import { executeQuery, executeQuerySingle, executeInsert } from './database';
import { Project, BlogPost, TeamMember, GalleryImage } from './types';

// Project Services
export async function getAllProjects(): Promise<Project[]> {
  const query = `
    SELECT 
      id, title, description, location, status, progress, 
      budget, raised, beneficiaries, start_date, featured_image,
      created_at, updated_at
    FROM projects 
    ORDER BY created_at DESC
  `;
  return executeQuery<Project>(query);
}

export async function getProjectById(id: number): Promise<Project | null> {
  const query = `
    SELECT 
      id, title, description, location, status, progress, 
      budget, raised, beneficiaries, start_date, featured_image,
      created_at, updated_at
    FROM projects 
    WHERE id = ?
  `;
  return executeQuerySingle<Project>(query, [id]);
}

export async function getActiveProjects(): Promise<Project[]> {
  const query = `
    SELECT 
      id, title, description, location, status, progress, 
      budget, raised, beneficiaries, start_date, featured_image,
      created_at, updated_at
    FROM projects 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;
  return executeQuery<Project>(query);
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const query = `
    INSERT INTO projects (
      title, description, location, status, progress, 
      budget, raised, beneficiaries, start_date, featured_image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    project.title,
    project.description,
    project.location,
    project.status,
    project.progress,
    project.budget,
    project.raised,
    project.beneficiaries,
    project.start_date,
    project.featured_image
  ];
  
  try {
    const result = await executeInsert(query, params);
    
    if (!result.insertId) {
      throw new Error('Failed to get insert ID');
    }
    
    // Return the created project
    const createdProject = await getProjectById(result.insertId);
    if (!createdProject) {
      throw new Error('Failed to retrieve created project');
    }
    return createdProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: number, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project> {
  const fields = [];
  const params = [];
  
  if (project.title !== undefined) {
    fields.push('title = ?');
    params.push(project.title);
  }
  if (project.description !== undefined) {
    fields.push('description = ?');
    params.push(project.description);
  }
  if (project.location !== undefined) {
    fields.push('location = ?');
    params.push(project.location);
  }
  if (project.status !== undefined) {
    fields.push('status = ?');
    params.push(project.status);
  }
  if (project.progress !== undefined) {
    fields.push('progress = ?');
    params.push(project.progress);
  }
  if (project.budget !== undefined) {
    fields.push('budget = ?');
    params.push(project.budget);
  }
  if (project.raised !== undefined) {
    fields.push('raised = ?');
    params.push(project.raised);
  }
  if (project.beneficiaries !== undefined) {
    fields.push('beneficiaries = ?');
    params.push(project.beneficiaries);
  }
  if (project.start_date !== undefined) {
    fields.push('start_date = ?');
    params.push(project.start_date);
  }
  if (project.featured_image !== undefined) {
    fields.push('featured_image = ?');
    params.push(project.featured_image);
  }
  
  fields.push('updated_at = NOW()');
  params.push(id);
  
  const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
  await executeQuery(query, params);
  
  const updatedProject = await getProjectById(id);
  if (!updatedProject) {
    throw new Error('Failed to update project');
  }
  return updatedProject;
}

export async function deleteProject(id: number): Promise<void> {
  const query = 'DELETE FROM projects WHERE id = ?';
  await executeQuery(query, [id]);
}

// Blog Services
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const query = `
    SELECT 
      id, title, slug, excerpt, content, category, author, 
      featured_image, published, created_at, updated_at
    FROM blog_posts 
    WHERE published = true
    ORDER BY created_at DESC
  `;
  return executeQuery<BlogPost>(query);
}

export async function getAllBlogPostsForAdmin(): Promise<BlogPost[]> {
  const query = `
    SELECT 
      id, title, slug, excerpt, content, category, author, 
      featured_image, published, created_at, updated_at
    FROM blog_posts 
    ORDER BY created_at DESC
  `;
  return executeQuery<BlogPost>(query);
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const query = `
    SELECT 
      id, title, slug, excerpt, content, category, author, 
      featured_image, published, created_at, updated_at
    FROM blog_posts 
    WHERE id = ? AND published = true
  `;
  return executeQuerySingle<BlogPost>(query, [id]);
}

export async function getBlogPostByIdForAdmin(id: number): Promise<BlogPost | null> {
  const query = `
    SELECT 
      id, title, slug, excerpt, content, category, author, 
      featured_image, published, created_at, updated_at
    FROM blog_posts 
    WHERE id = ?
  `;
  return executeQuerySingle<BlogPost>(query, [id]);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `
    SELECT 
      id, title, slug, excerpt, content, category, author, 
      featured_image, published, created_at, updated_at
    FROM blog_posts 
    WHERE slug = ? AND published = true
  `;
  return executeQuerySingle<BlogPost>(query, [slug]);
}

export async function createBlogPost(blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
  const query = `
    INSERT INTO blog_posts (
      title, slug, excerpt, content, category, author, 
      featured_image, published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    blogPost.title,
    blogPost.slug,
    blogPost.excerpt,
    blogPost.content,
    blogPost.category,
    blogPost.author,
    blogPost.featured_image,
    blogPost.published
  ];
  
  try {
    const result = await executeInsert(query, params);
    
    if (!result.insertId) {
      throw new Error('Failed to get insert ID');
    }
    
    // Return the created blog post using admin function (no published filter)
    const createdBlogPost = await getBlogPostByIdForAdmin(result.insertId);
    if (!createdBlogPost) {
      throw new Error('Failed to retrieve created blog post');
    }
    return createdBlogPost;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}

export async function updateBlogPost(id: number, blogPost: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<BlogPost> {
  const fields = [];
  const params = [];
  
  if (blogPost.title !== undefined) {
    fields.push('title = ?');
    params.push(blogPost.title);
  }
  if (blogPost.slug !== undefined) {
    fields.push('slug = ?');
    params.push(blogPost.slug);
  }
  if (blogPost.excerpt !== undefined) {
    fields.push('excerpt = ?');
    params.push(blogPost.excerpt);
  }
  if (blogPost.content !== undefined) {
    fields.push('content = ?');
    params.push(blogPost.content);
  }
  if (blogPost.category !== undefined) {
    fields.push('category = ?');
    params.push(blogPost.category);
  }
  if (blogPost.author !== undefined) {
    fields.push('author = ?');
    params.push(blogPost.author);
  }
  if (blogPost.featured_image !== undefined) {
    fields.push('featured_image = ?');
    params.push(blogPost.featured_image);
  }
  if (blogPost.published !== undefined) {
    fields.push('published = ?');
    params.push(blogPost.published);
  }
  
  fields.push('updated_at = NOW()');
  params.push(id);
  
  const query = `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`;
  await executeQuery(query, params);
  
  const updatedBlogPost = await getBlogPostByIdForAdmin(id);
  if (!updatedBlogPost) {
    throw new Error('Failed to update blog post');
  }
  return updatedBlogPost;
}

export async function deleteBlogPost(id: number): Promise<void> {
  const query = 'DELETE FROM blog_posts WHERE id = ?';
  await executeQuery(query, [id]);
}

// Team Services
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const query = `
    SELECT 
      id, name, role, bio, image, email, linkedin, twitter, 
      order_index, active, created_at
    FROM team_members 
    WHERE active = true
    ORDER BY order_index ASC
  `;
  return executeQuery<TeamMember>(query);
}

// Gallery Services
export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const query = `
    SELECT 
      id, title, description, category, image_url, alt_text, 
      order_index, active, created_at
    FROM gallery_images 
    WHERE active = true
    ORDER BY order_index ASC
  `;
  return executeQuery<GalleryImage>(query);
}

export async function getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
  const query = `
    SELECT 
      id, title, description, category, image_url, alt_text, 
      order_index, active, created_at
    FROM gallery_images 
    WHERE category = ? AND active = true
    ORDER BY order_index ASC
  `;
  return executeQuery<GalleryImage>(query, [category]);
}

// Statistics Services
export async function getProjectStats() {
  const totalProjectsQuery = 'SELECT COUNT(*) as total FROM projects';
  const activeProjectsQuery = 'SELECT COUNT(*) as active FROM projects WHERE status = "active"';
  const totalBeneficiariesQuery = 'SELECT SUM(beneficiaries) as total FROM projects WHERE beneficiaries IS NOT NULL';
  const totalRaisedQuery = 'SELECT SUM(raised) as total FROM projects WHERE raised IS NOT NULL';

  const [totalProjects, activeProjects, totalBeneficiaries, totalRaised] = await Promise.all([
    executeQuerySingle(totalProjectsQuery),
    executeQuerySingle(activeProjectsQuery),
    executeQuerySingle(totalBeneficiariesQuery),
    executeQuerySingle(totalRaisedQuery),
  ]);

  return {
    totalProjects: totalProjects?.total || 0,
    activeProjects: activeProjects?.active || 0,
    totalBeneficiaries: totalBeneficiaries?.total || 0,
    totalRaised: totalRaised?.total || 0,
  };
}
